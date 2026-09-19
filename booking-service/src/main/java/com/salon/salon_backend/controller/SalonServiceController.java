package com.salon.controller;

import com.salon.model.SalonService;
import com.salon.service.SalonServiceService;
import com.salon.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/services")
@CrossOrigin(origins = "*")
public class SalonServiceController {

    @Autowired
    private SalonServiceService service;

    @Autowired
    private JwtUtil jwtUtil;

    // Endpoint to get all services: GET http://localhost:8080/api/services (Public)
    @GetMapping
    public List<SalonService> getAllServices() {
        return service.getAllServices();
    }

    // Endpoint to add a service: POST http://localhost:8080/api/services (Protected - ADMIN/STYLIST)
    @PostMapping
    public ResponseEntity<?> addService(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestBody SalonService salonService) {

        // 1. Verify Authorization Header
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Unauthorized: Missing or invalid Authorization token");
        }

        String token = authHeader.substring(7);

        // 2. Validate Token Signature & Expiration
        if (!jwtUtil.isTokenValid(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Unauthorized: Invalid or expired token");
        }

        // 3. Verify Role (Only ADMIN or STYLIST can create services)
        String role = jwtUtil.extractRole(token);
        if (!"ADMIN".equalsIgnoreCase(role) && !"STYLIST".equalsIgnoreCase(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Forbidden: Only ADMIN or STYLIST can add new salon services");
        }

        SalonService savedService = service.saveService(salonService);
        return ResponseEntity.ok(savedService);
    }
}