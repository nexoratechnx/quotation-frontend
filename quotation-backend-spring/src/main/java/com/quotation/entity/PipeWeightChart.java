package com.quotation.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "pipe_weight_chart",
        uniqueConstraints = @UniqueConstraint(columnNames = {"variant", "size", "thickness"}))
public class PipeWeightChart {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String variant; // ROUND / SQUARE / RECTANGLE

    @Column(nullable = false)
    private String size;    // 33.7 / 25x25 / 40x20

    @Column(nullable = false, precision = 4, scale = 2)
    private BigDecimal thickness;

    @Column(name = "weight_per_meter", nullable = false, precision = 10, scale = 3)
    private BigDecimal weightPerMeter;

    // Getters and Setters

    public Long getId() { return id; }

    public String getVariant() { return variant; }
    public void setVariant(String variant) { this.variant = variant; }

    public String getSize() { return size; }
    public void setSize(String size) { this.size = size; }

    public BigDecimal getThickness() { return thickness; }
    public void setThickness(BigDecimal thickness) { this.thickness = thickness; }

    public BigDecimal getWeightPerMeter() { return weightPerMeter; }
    public void setWeightPerMeter(BigDecimal weightPerMeter) { this.weightPerMeter = weightPerMeter; }
}