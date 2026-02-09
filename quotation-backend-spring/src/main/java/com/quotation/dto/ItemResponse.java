package com.quotation.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class ItemResponse {
    private Long id;
    private String name;
    private BigDecimal price;
    private CategoryResponse category;
    private String description;
    /** Unit type: PCS, KG, SQFT, BOX */
    private String unitType;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
