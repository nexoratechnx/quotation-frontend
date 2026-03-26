package com.quotation.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "sheet_items")
public class SheetWeightChart {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String size;  // e.g. "8x4", "10x5", "6x4"

    @Column(name = "length", nullable = false, precision = 10, scale = 4)
    private BigDecimal length;  // length in meters

    @Column(name = "width", nullable = false, precision = 10, scale = 4)
    private BigDecimal width;   // width in meters

    // Getters and Setters

    public Long getId() { return id; }

    public String getSize() { return size; }
    public void setSize(String size) { this.size = size; }

    public BigDecimal getLength() { return length; }
    public void setLength(BigDecimal length) { this.length = length; }

    public BigDecimal getWidth() { return width; }
    public void setWidth(BigDecimal width) { this.width = width; }
}
