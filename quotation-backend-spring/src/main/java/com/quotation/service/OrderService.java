package com.quotation.service;

import com.quotation.dto.OrderItemRequest;
import com.quotation.dto.OrderItemResponse;
import com.quotation.dto.OrderRequest;
import com.quotation.dto.OrderResponse;
import com.quotation.entity.*;
import com.quotation.exception.ResourceNotFoundException;
import com.quotation.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private ItemRepository itemRepository;

    @Autowired
    private UserRepository userRepository;

    public List<OrderResponse> getAllOrders() {
        return orderRepository.findAll().stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public OrderResponse getOrderById(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", id));
        return convertToResponse(order);
    }

    @Transactional
    public OrderResponse createOrder(OrderRequest request) {
        User currentUser = getCurrentUser();
        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer", "id", request.getCustomerId()));
        
        Employee employee = null;
        if (request.getEmployeeId() != null) {
            employee = employeeRepository.findById(request.getEmployeeId())
                    .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", request.getEmployeeId()));
        }

        Order order = new Order();
        order.setOrderNumber(generateOrderNumber());
        order.setCustomer(customer);
        order.setCustomerName(customer.getName());
        order.setEmployee(employee);
        order.setGstEnabled(request.getGstEnabled() != null ? request.getGstEnabled() : false);
        order.setNotes(request.getNotes());
        order.setCreatedBy(currentUser);
        order.setStatus(Order.OrderStatus.PENDING);
        order.setBillingDate(LocalDate.now());

        // Process order items
        List<OrderItem> orderItems = request.getItems().stream()
                .map(itemRequest -> createOrderItem(itemRequest))
                .collect(Collectors.toList());
        order.setItems(orderItems);

        // Calculate totals
        calculateOrderTotals(order);

        Order saved = orderRepository.save(order);
        return convertToResponse(saved);
    }

    @Transactional
    public OrderResponse updateOrder(Long id, OrderRequest request) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", id));

        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer", "id", request.getCustomerId()));
        
        Employee employee = null;
        if (request.getEmployeeId() != null) {
            employee = employeeRepository.findById(request.getEmployeeId())
                    .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", request.getEmployeeId()));
        }

        order.setCustomer(customer);
        order.setCustomerName(customer.getName());
        order.setEmployee(employee);
        order.setGstEnabled(request.getGstEnabled() != null ? request.getGstEnabled() : false);
        order.setNotes(request.getNotes());

        // Update order items
        List<OrderItem> orderItems = request.getItems().stream()
                .map(itemRequest -> createOrderItem(itemRequest))
                .collect(Collectors.toList());
        order.setItems(orderItems);

        // Recalculate totals
        calculateOrderTotals(order);

        Order updated = orderRepository.save(order);
        return convertToResponse(updated);
    }

    @Transactional
    public OrderResponse updateOrderStatus(Long id, Order.OrderStatus status) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", id));
        order.setStatus(status);
        Order updated = orderRepository.save(order);
        return convertToResponse(updated);
    }

    public void deleteOrder(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", id));
        orderRepository.delete(order);
    }

    private OrderItem createOrderItem(OrderItemRequest request) {
        Item item = itemRepository.findById(request.getItemId())
                .orElseThrow(() -> new ResourceNotFoundException("Item", "id", request.getItemId()));

        OrderItem orderItem = new OrderItem();
        orderItem.setItemId(item.getId());
        orderItem.setItemName(item.getName());
        orderItem.setUnitType(item.getUnitType());
        orderItem.setUnitValue(request.getUnitValue());
        BigDecimal sellingPrice = request.getPrice() != null ? request.getPrice() : item.getPrice();
        orderItem.setPrice(sellingPrice);
        orderItem.setAmount(sellingPrice.multiply(request.getUnitValue()));

        return orderItem;
    }

    private void calculateOrderTotals(Order order) {
        // Calculate subtotal
        BigDecimal subtotal = order.getItems().stream()
                .map(OrderItem::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        order.setSubtotal(subtotal);

        // Calculate GST
        if (order.getGstEnabled()) {
            BigDecimal gstRate = BigDecimal.valueOf(order.getGstRate()).divide(BigDecimal.valueOf(100));
            BigDecimal gstAmount = subtotal.multiply(gstRate);
            order.setGstAmount(gstAmount);
            order.setTotal(subtotal.add(gstAmount));
        } else {
            order.setGstAmount(BigDecimal.ZERO);
            order.setTotal(subtotal);
        }
    }

    private String generateOrderNumber() {
        String datePart = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        long count = orderRepository.count() + 1;
        return String.format("ORD-%s-%04d", datePart, count);
    }

    private OrderResponse convertToResponse(Order order) {
        OrderResponse response = new OrderResponse();
        response.setId(order.getId());
        response.setOrderNumber(order.getOrderNumber());
        response.setCustomerId(order.getCustomer().getId());
        response.setCustomerName(order.getCustomerName());
        response.setCustomerPhone(order.getCustomer().getPhone());
        
        if (order.getEmployee() != null) {
            response.setEmployeeId(order.getEmployee().getId());
            response.setEmployeeName(order.getEmployee().getName());
        }
        
        List<OrderItemResponse> itemResponses = order.getItems().stream()
                .map(this::convertOrderItemToResponse)
                .collect(Collectors.toList());
        response.setItems(itemResponses);
        
        response.setSubtotal(order.getSubtotal());
        response.setGstEnabled(order.getGstEnabled());
        response.setGstAmount(order.getGstAmount());
        response.setGstRate(order.getGstRate());
        response.setTotal(order.getTotal());
        response.setStatus(order.getStatus().name());
        response.setBillingDate(order.getBillingDate());
        response.setNotes(order.getNotes());
        response.setCreatedAt(order.getCreatedAt());
        response.setUpdatedAt(order.getUpdatedAt());
        
        return response;
    }

    private OrderItemResponse convertOrderItemToResponse(OrderItem item) {
        OrderItemResponse response = new OrderItemResponse();
        response.setItemId(item.getItemId());
        response.setItemName(item.getItemName());
        response.setUnitType(item.getUnitType() != null ? item.getUnitType().name() : null);
        response.setUnitValue(item.getUnitValue());
        response.setPrice(item.getPrice());
        response.setAmount(item.getAmount());
        return response;
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
    }
}
