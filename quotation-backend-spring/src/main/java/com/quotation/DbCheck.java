package com.quotation;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;

@Component
public class DbCheck {

    @Value("${spring.datasource.url}")
    private String dbUrl;

    @PostConstruct
    public void printDbUrl() {
        System.out.println("🔥 CONNECTED DB URL: " + dbUrl);
    }
}