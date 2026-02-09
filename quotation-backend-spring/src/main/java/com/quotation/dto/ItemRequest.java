package com.quotation.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class ItemRequest {
    
    @NotBlank(message = "Item name is required")
    private String name;
    
    @NotNull(message = "Price is required")
    @Positive(message = "Price must be positive")
    private BigDecimal price;
    
    @NotNull(message = "Category is required")
    private Long categoryId;
    
    private String description;
    /** Unit type: PCS, KG, SQFT, BOX */
    private String unitType = "PCS";
    private Boolean isActive = true;
}
