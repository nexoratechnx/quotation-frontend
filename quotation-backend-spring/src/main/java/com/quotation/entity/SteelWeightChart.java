package com.quotation.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "steel_weight_chart")
public class SteelWeightChart {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "type", nullable = false)
    private String sectionType;  // ANGLE, FLAT, CHANNEL, BEAM, etc.

    @Column(nullable = false)
    private String size;  // e.g. 50x50x6, 25x3, etc.

    @Column(name = "weight_per_meter", nullable = false, precision = 10, scale = 3)
    private BigDecimal weightPerMeter;

    // Getters and Setters

    public Long getId() { return id; }

    public String getSectionType() { return sectionType; }
    public void setSectionType(String sectionType) { this.sectionType = sectionType; }

    public String getSize() { return size; }
    public void setSize(String size) { this.size = size; }

    public BigDecimal getWeightPerMeter() { return weightPerMeter; }
    public void setWeightPerMeter(BigDecimal weightPerMeter) { this.weightPerMeter = weightPerMeter; }
}
