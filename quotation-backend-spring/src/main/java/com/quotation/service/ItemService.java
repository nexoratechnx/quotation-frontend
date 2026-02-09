package com.quotation.service;

import com.quotation.dto.CategoryResponse;
import com.quotation.dto.ItemRequest;
import com.quotation.dto.ItemResponse;
import com.quotation.entity.Category;
import com.quotation.entity.Item;
import com.quotation.entity.User;
import com.quotation.exception.ResourceNotFoundException;
import com.quotation.repository.CategoryRepository;
import com.quotation.repository.ItemRepository;
import com.quotation.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ItemService {

    @Autowired
    private ItemRepository itemRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private UserRepository userRepository;

    public List<ItemResponse> getAllItems(String search, Long categoryId) {
        List<Item> items;
        
        if (search != null && !search.isEmpty() && categoryId != null) {
            items = itemRepository.findByNameContainingIgnoreCaseAndCategoryId(search, categoryId);
        } else if (search != null && !search.isEmpty()) {
            items = itemRepository.findByNameContainingIgnoreCase(search);
        } else if (categoryId != null) {
            items = itemRepository.findByCategoryId(categoryId);
        } else {
            items = itemRepository.findAll();
        }
        
        return items.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public ItemResponse getItemById(Long id) {
        Item item = itemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Item", "id", id));
        return convertToResponse(item);
    }

    public ItemResponse createItem(ItemRequest request) {
        User currentUser = getCurrentUser();
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.getCategoryId()));

        Item item = new Item();
        item.setName(request.getName());
        item.setCategory(category);
        item.setPrice(request.getPrice());
        item.setDescription(request.getDescription());
        item.setUnitType(parseUnitType(request.getUnitType()));
        item.setCreatedBy(currentUser);

        Item saved = itemRepository.save(item);
        return convertToResponse(saved);
    }

    public ItemResponse updateItem(Long id, ItemRequest request) {
        Item item = itemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Item", "id", id));
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.getCategoryId()));

        item.setName(request.getName());
        item.setCategory(category);
        item.setPrice(request.getPrice());
        item.setDescription(request.getDescription());
        item.setUnitType(parseUnitType(request.getUnitType()));

        Item updated = itemRepository.save(item);
        return convertToResponse(updated);
    }

    public void deleteItem(Long id) {
        Item item = itemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Item", "id", id));
        itemRepository.delete(item);
    }

    private ItemResponse convertToResponse(Item item) {
        ItemResponse response = new ItemResponse();
        response.setId(item.getId());
        response.setName(item.getName());
        
        CategoryResponse categoryResponse = new CategoryResponse();
        categoryResponse.setId(item.getCategory().getId());
        categoryResponse.setName(item.getCategory().getName());
        categoryResponse.setDescription(item.getCategory().getDescription());
        response.setCategory(categoryResponse);
        
        response.setPrice(item.getPrice());
        response.setDescription(item.getDescription());
        response.setUnitType(item.getUnitType() != null ? item.getUnitType().name() : "PCS");
        response.setIsActive(item.getIsActive());
        response.setCreatedAt(item.getCreatedAt());
        response.setUpdatedAt(item.getUpdatedAt());
        return response;
    }

    private Item.UnitType parseUnitType(String value) {
        if (value == null || value.isEmpty()) return Item.UnitType.PCS;
        try {
            return Item.UnitType.valueOf(value.toUpperCase());
        } catch (IllegalArgumentException e) {
            return Item.UnitType.PCS;
        }
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
    }
}
