package com.quotation.service;

import com.quotation.entity.SheetWeightChart;
import com.quotation.repository.SheetWeightChartRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
public class SheetCalculationService {

    @Autowired
    private SheetWeightChartRepository sheetWeightChartRepository;

    private static final BigDecimal STEEL_DENSITY = new BigDecimal("7.85");

    /**
     * Calculate total weight for a steel sheet (plate).
     * Formula: weight = lengthM × widthM × thickness(mm) × 7.85
     *
     * @param size       e.g. "8x4", "10x5"
     * @param thickness  thickness in mm (user-entered)
     * @param quantity   number of sheets
     * @return total weight in kg
     */
    public BigDecimal calculateWeight(String size, BigDecimal thickness, BigDecimal quantity) {

        SheetWeightChart chartData = sheetWeightChartRepository
                .findFirstBySizeIgnoreCase(size)
                .orElseThrow(() ->
                        new RuntimeException("Sheet size not found: " + size)
                );

        BigDecimal lengthM = chartData.getLength();
        BigDecimal widthM = chartData.getWidth();

        // weight per sheet = L × W × T × 7.85
        BigDecimal weightPerSheet = lengthM.multiply(widthM).multiply(thickness).multiply(STEEL_DENSITY);

        // total weight = weight per sheet × quantity
        BigDecimal totalWeight = weightPerSheet.multiply(quantity);

        return totalWeight.setScale(3, RoundingMode.HALF_UP);
    }
}
