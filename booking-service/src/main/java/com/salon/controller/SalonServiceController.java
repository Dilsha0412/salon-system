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

    // Endpoint to get all services
    @GetMapping
    public List<SalonService> getAllServices() {
        return service.getAllServices();
    }

    // Endpoint to get single service
    @GetMapping("/{id}")
    public ResponseEntity<SalonService> getServiceById(@PathVariable Long id) {
        return service.getServiceById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Endpoint to add a service
    @PostMapping
    public ResponseEntity<?> addService(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestBody SalonService salonService) {

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            if (jwtUtil.isTokenValid(token)) {
                String role = jwtUtil.extractRole(token);
                if (!"ADMIN".equalsIgnoreCase(role) && !"STYLIST".equalsIgnoreCase(role)) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN)
                            .body("Forbidden: Only ADMIN or STYLIST can add new salon services");
                }
            }
        }

        SalonService savedService = service.saveService(salonService);
        return ResponseEntity.ok(savedService);
    }

    // Endpoint to update a service
    @PutMapping("/{id}")
    public ResponseEntity<?> updateService(
            @PathVariable Long id,
            @RequestBody SalonService salonService) {

        return service.updateService(id, salonService)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Endpoint to delete a service
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteService(@PathVariable Long id) {
        boolean deleted = service.deleteService(id);
        if (deleted) {
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}