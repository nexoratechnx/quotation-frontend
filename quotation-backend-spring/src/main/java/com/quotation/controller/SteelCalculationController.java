package com.quotation.controller;

import com.quotation.entity.SteelWeightChart;
import com.quotation.repository.SteelWeightChartRepository;
import com.quotation.service.SteelCalculationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.*;

@RestController
@RequestMapping("/api/steel")
@CrossOrigin
public class SteelCalculationController {

    @Autowired
    private SteelCalculationService steelCalculationService;

    @Autowired
    private SteelWeightChartRepository steelWeightChartRepository;

    // ==============================
    // 1️⃣ CALCULATE WEIGHT API
    // ==============================
    @PostMapping("/calculate")
    public ResponseEntity<Map<String, Object>> calculateSteelWeight(
            @RequestBody Map<String, String> request
    ) {
        String sectionType = request.get("type");
        String size = request.get("size");
        BigDecimal length = new BigDecimal(request.get("length"));

        BigDecimal totalWeight = steelCalculationService.calculateWeight(sectionType, size, length);

        Map<String, Object> response = new HashMap<>();
        response.put("totalWeight", totalWeight);

        return ResponseEntity.ok(response);
    }

    // ==============================
    // 2️⃣ GET ALL STEEL CHART ENTRIES
    // Returns each entry with a 'type' key (mapped from sectionType)
    // ==============================
    @GetMapping("/all")
    public ResponseEntity<List<Map<String, Object>>> getAllSteelChartEntries() {
        List<SteelWeightChart> all = steelWeightChartRepository.findAll();

        // Map to plain JSON so frontend receives "type" (not "sectionType")
        List<Map<String, Object>> result = new ArrayList<>();
        for (SteelWeightChart s : all) {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("id", s.getId());
            row.put("type", s.getSectionType());
            row.put("size", s.getSize());
            row.put("weightPerMeter", s.getWeightPerMeter());
            result.add(row);
        }

        return ResponseEntity.ok(result);
    }
}
