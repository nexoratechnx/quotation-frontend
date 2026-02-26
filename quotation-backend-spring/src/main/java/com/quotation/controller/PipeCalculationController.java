package com.quotation.controller;

import com.quotation.entity.PipeWeightChart;
import com.quotation.repository.PipeWeightChartRepository;
import com.quotation.service.PipeCalculationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/pipe")
@CrossOrigin
public class PipeCalculationController {

    @Autowired
    private PipeCalculationService pipeCalculationService;

    @Autowired
    private PipeWeightChartRepository pipeWeightChartRepository;

    // ==============================
    // 1️⃣ CALCULATE WEIGHT API
    // ==============================
    @PostMapping("/calculate")
    public ResponseEntity<Map<String, Object>> calculatePipeWeight(
            @RequestBody Map<String, String> request
    ) {

        String variant = request.get("variant");
        String size = request.get("size");
        BigDecimal thickness = new BigDecimal(request.get("thickness"));
        BigDecimal length = new BigDecimal(request.get("length"));

        BigDecimal totalWeight = pipeCalculationService
                .calculateWeight(variant, size, thickness, length);

        Map<String, Object> response = new HashMap<>();
        response.put("totalWeight", totalWeight);

        return ResponseEntity.ok(response);
    }

    // ==============================
    // 2️⃣ GET ALL VARIANTS
    // ==============================
    @GetMapping("/variants")
    public ResponseEntity<List<String>> getAllVariants() {

        List<String> variants = pipeWeightChartRepository
                .findAll()
                .stream()
                .map(PipeWeightChart::getVariant)
                .distinct()
                .collect(Collectors.toList());

        return ResponseEntity.ok(variants);
    }

    // ==============================
    // 3️⃣ GET SIZES BY VARIANT
    // ==============================
    @GetMapping("/sizes/{variant}")
    public ResponseEntity<List<String>> getSizesByVariant(
            @PathVariable String variant) {

        List<String> sizes = pipeWeightChartRepository
                .findAll()
                .stream()
                .filter(p -> p.getVariant().equalsIgnoreCase(variant))
                .map(PipeWeightChart::getSize)
                .distinct()
                .collect(Collectors.toList());

        return ResponseEntity.ok(sizes);
    }

    // ==============================
    // 4️⃣ GET THICKNESS BY VARIANT + SIZE
    // ==============================
    @GetMapping("/thickness/{variant}/{size}")
    public ResponseEntity<List<BigDecimal>> getThicknessByVariantAndSize(
            @PathVariable String variant,
            @PathVariable String size) {

        List<BigDecimal> thickness = pipeWeightChartRepository
                .findAll()
                .stream()
                .filter(p -> p.getVariant().equalsIgnoreCase(variant)
                        && p.getSize().equalsIgnoreCase(size))
                .map(PipeWeightChart::getThickness)
                .distinct()
                .collect(Collectors.toList());

        return ResponseEntity.ok(thickness);
    }
}