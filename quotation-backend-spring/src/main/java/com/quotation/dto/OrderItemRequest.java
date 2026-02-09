package com.quotation.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class OrderItemRequest {
    
    @NotNull(message = "Item ID is required")
    private Long itemId;
    
    @NotNull(message = "Unit value is required")
    @Positive(message = "Unit value must be positive")
    private BigDecimal unitValue;

    /** Selling price per unit (current billing price); 0 allowed until user sets it */
    @NotNull(message = "Price is required")
    @PositiveOrZero(message = "Price must be zero or positive")
    private BigDecimal price;
}
