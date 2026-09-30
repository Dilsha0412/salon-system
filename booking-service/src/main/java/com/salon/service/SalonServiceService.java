package com.salon.service;

import com.salon.model.SalonService;
import com.salon.repository.SalonServiceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SalonServiceService {

    @Autowired
    private SalonServiceRepository repository;

    // Get all services
    public List<SalonService> getAllServices() {
        return repository.findAll();
    }

    // Save a new service
    public SalonService saveService(SalonService service) {
        return repository.save(service);
    }
}