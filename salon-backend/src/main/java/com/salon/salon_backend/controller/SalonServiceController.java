package com.salon.controller;

import com.salon.model.SalonService;
import com.salon.service.SalonServiceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/services")
@CrossOrigin(origins = "http://localhost:5173")
public class SalonServiceController {

    @Autowired
    private SalonServiceService service;

    // Endpoint to get all services: GET http://localhost:8080/api/services
    @GetMapping
    public List<SalonService> getAllServices() {
        return service.getAllServices();
    }

    // Endpoint to add a service: POST http://localhost:8080/api/services
    @PostMapping
    public SalonService addService(@RequestBody SalonService salonService) {
        return service.saveService(salonService);
    }
}