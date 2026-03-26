package com.quotation.controller;

import com.quotation.entity.SheetWeightChart;
import com.quotation.repository.SheetWeightChartRepository;
import com.quotation.service.SheetCalculationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.*;

@RestController
@RequestMapping("/api/sheet")
@CrossOrigin
public class SheetCalculationController {

    @Autowired
    private SheetCalculationService sheetCalculationService;

    @Autowired
    private SheetWeightChartRepository sheetWeightChartRepository;

    // ==============================
    // 1️⃣ CALCULATE WEIGHT API
    // POST /api/sheet/calculate
    // Body: { size, thickness, quantity }
    // ==============================
    @PostMapping("/calculate")
    public ResponseEntity<Map<String, Object>> calculateSheetWeight(
            @RequestBody Map<String, String> request
    ) {
        String size = request.get("size");
        BigDecimal thickness = new BigDecimal(request.get("thickness"));
        BigDecimal quantity = request.containsKey("quantity")
                ? new BigDecimal(request.get("quantity"))
                : BigDecimal.ONE;

        BigDecimal totalWeight = sheetCalculationService.calculateWeight(size, thickness, quantity);

        Map<String, Object> response = new HashMap<>();
        response.put("totalWeight", totalWeight);

        return ResponseEntity.ok(response);
    }

    // ==============================
    // 2️⃣ GET ALL SHEET SIZES
    // GET /api/sheet/all
    // ==============================
    @GetMapping("/all")
    public ResponseEntity<List<Map<String, Object>>> getAllSheetSizes() {
        List<SheetWeightChart> all = sheetWeightChartRepository.findAll();

        List<Map<String, Object>> result = new ArrayList<>();
        for (SheetWeightChart s : all) {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("id", s.getId());
            row.put("size", s.getSize());
            row.put("lengthM", s.getLength());
            row.put("widthM", s.getWidth());
            result.add(row);
        }

        return ResponseEntity.ok(result);
    }
}
