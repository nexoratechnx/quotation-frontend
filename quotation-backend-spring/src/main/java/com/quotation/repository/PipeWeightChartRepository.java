package com.quotation.repository;

import com.quotation.entity.PipeWeightChart;
import org.springframework.data.jpa.repository.JpaRepository;
import java.math.BigDecimal;
import java.util.Optional;

public interface PipeWeightChartRepository extends JpaRepository<PipeWeightChart, Long> {

    Optional<PipeWeightChart>
    findByVariantAndSizeAndThickness(
            String variant,
            String size,
            BigDecimal thickness
    );
}