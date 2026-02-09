package com.quotation.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderItem {

    @Column(name = "item_id", nullable = false)
    private Long itemId;

    @Column(nullable = false)
    private String itemName;

    @Enumerated(EnumType.STRING)
    @Column(name = "unit_type", length = 20, nullable = false)
    private Item.UnitType unitType;

    @Column(name = "unit_value", nullable = false, precision = 12, scale = 4)
    private BigDecimal unitValue;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;
}
