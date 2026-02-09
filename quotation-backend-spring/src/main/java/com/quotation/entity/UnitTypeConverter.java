package com.quotation.entity;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

/**
 * Converts DB string (e.g. "pcs", "PCS") to Item.UnitType enum
 * so existing stored values load correctly.
 */
@Converter(autoApply = false)
public class UnitTypeConverter implements AttributeConverter<Item.UnitType, String> {

    @Override
    public String convertToDatabaseColumn(Item.UnitType attribute) {
        return attribute == null ? null : attribute.name();
    }

    @Override
    public Item.UnitType convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.isEmpty()) return Item.UnitType.PCS;
        try {
            return Item.UnitType.valueOf(dbData.toUpperCase().trim());
        } catch (IllegalArgumentException e) {
            return Item.UnitType.PCS;
        }
    }
}
