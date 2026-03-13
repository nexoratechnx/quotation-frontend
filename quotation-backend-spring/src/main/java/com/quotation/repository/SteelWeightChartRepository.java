package com.quotation.repository;

import com.quotation.entity.SteelWeightChart;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface SteelWeightChartRepository extends JpaRepository<SteelWeightChart, Long> {

    // Use findFirst to safely handle any duplicate entries in the chart table
    Optional<SteelWeightChart> findFirstBySectionTypeIgnoreCaseAndSizeIgnoreCase(String sectionType, String size);
}
