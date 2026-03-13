package com.quotation.service;

import com.quotation.entity.SteelWeightChart;
import com.quotation.repository.SteelWeightChartRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
public class SteelCalculationService {

    @Autowired
    private SteelWeightChartRepository steelWeightChartRepository;

    /**
     * Calculate total weight for steel sections.
     * Formula: weight = weight_per_meter × length
     *
     * @param sectionType  e.g. "ANGLE", "FLAT", "CHANNEL", "BEAM"
     * @param size         e.g. "50x50x6"
     * @param length       total length in meters entered by user
     * @return total weight in kg
     */
    public BigDecimal calculateWeight(String sectionType, String size, BigDecimal length) {

        SteelWeightChart chartData = steelWeightChartRepository
                .findFirstBySectionTypeIgnoreCaseAndSizeIgnoreCase(sectionType, size)
                .orElseThrow(() ->
                        new RuntimeException("Steel data not found for type: " + sectionType + ", size: " + size)
                );

        BigDecimal weightPerMeter = chartData.getWeightPerMeter();
        BigDecimal standardLength = new BigDecimal("6");
        BigDecimal effectiveLength = standardLength.multiply(length); // value = 6 × input_length
        BigDecimal totalWeight = weightPerMeter.multiply(effectiveLength); // weight = value × weight_per_meter

        return totalWeight.setScale(3, RoundingMode.HALF_UP);
    }
}
