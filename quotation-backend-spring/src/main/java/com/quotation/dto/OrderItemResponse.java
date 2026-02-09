package com.quotation.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class OrderItemResponse {
    private Long itemId;
    private String itemName;
    private String unitType;
    private BigDecimal unitValue;
    private BigDecimal price;
    private BigDecimal amount;
}
