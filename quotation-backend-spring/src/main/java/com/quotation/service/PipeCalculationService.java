package com.quotation.service;

import com.quotation.entity.PipeWeightChart;
import com.quotation.repository.PipeWeightChartRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
public class PipeCalculationService {

    @Autowired
    private PipeWeightChartRepository pipeWeightChartRepository;

    public BigDecimal calculateWeight(
            String variant,
            String size,
            BigDecimal thickness,
            BigDecimal length
    ) {

        PipeWeightChart chartData = pipeWeightChartRepository
                .findByVariantAndSizeAndThickness(variant, size, thickness)
                .orElseThrow(() ->
                        new RuntimeException("Pipe data not found in chart")
                );

        BigDecimal weightPerMeter = chartData.getWeightPerMeter();

        BigDecimal totalWeight = weightPerMeter.multiply(length);

        return totalWeight.setScale(3, RoundingMode.HALF_UP);
    }
}