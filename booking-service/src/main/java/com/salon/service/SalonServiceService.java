package com.salon.service;

import com.salon.model.SalonService;
import com.salon.repository.SalonServiceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class SalonServiceService {

    @Autowired
    private SalonServiceRepository repository;

    // Get all services
    public List<SalonService> getAllServices() {
        return repository.findAll();
    }

    // Get service by id
    public Optional<SalonService> getServiceById(Long id) {
        return repository.findById(id);
    }

    // Save a new service
    public SalonService saveService(SalonService service) {
        return repository.save(service);
    }

    // Update existing service
    public Optional<SalonService> updateService(Long id, SalonService updated) {
        return repository.findById(id).map(existing -> {
            if (updated.getName() != null) existing.setName(updated.getName());
            if (updated.getDescription() != null) existing.setDescription(updated.getDescription());
            if (updated.getPrice() != null) existing.setPrice(updated.getPrice());
            if (updated.getCategory() != null) existing.setCategory(updated.getCategory());
            if (updated.getDurationMinutes() != null) existing.setDurationMinutes(updated.getDurationMinutes());
            if (updated.getRating() != null) existing.setRating(updated.getRating());
            if (updated.getReviewCount() != null) existing.setReviewCount(updated.getReviewCount());
            return repository.save(existing);
        });
    }

    // Delete service
    public boolean deleteService(Long id) {
        if (repository.existsById(id)) {
            repository.deleteById(id);
            return true;
        }
        return false;
    }
}