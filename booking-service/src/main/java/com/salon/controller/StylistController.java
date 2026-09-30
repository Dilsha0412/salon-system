package com.salon.controller;

import com.salon.model.Stylist;
import com.salon.repository.StylistRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/stylists")
@CrossOrigin(origins = "*")
public class StylistController {

    @Autowired
    private StylistRepository stylistRepository;

    // Get all active stylists
    @GetMapping
    public List<Stylist> getAllActiveStylists() {
        return stylistRepository.findByActiveTrue();
    }

    // Get single stylist
    @GetMapping("/{id}")
    public ResponseEntity<Stylist> getStylistById(@PathVariable Long id) {
        Optional<Stylist> stylist = stylistRepository.findById(id);
        return stylist.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Add new stylist
    @PostMapping
    public Stylist addStylist(@RequestBody Stylist stylist) {
        if (stylist.getActive() == null) {
            stylist.setActive(true);
        }
        return stylistRepository.save(stylist);
    }

    // Update stylist details
    @PutMapping("/{id}")
    public ResponseEntity<Stylist> updateStylist(@PathVariable Long id, @RequestBody Stylist updatedData) {
        return stylistRepository.findById(id).map(existing -> {
            if (updatedData.getName() != null) existing.setName(updatedData.getName());
            if (updatedData.getSpecialty() != null) existing.setSpecialty(updatedData.getSpecialty());
            if (updatedData.getPhone() != null) existing.setPhone(updatedData.getPhone());
            if (updatedData.getEmail() != null) existing.setEmail(updatedData.getEmail());
            if (updatedData.getActive() != null) existing.setActive(updatedData.getActive());
            return ResponseEntity.ok(stylistRepository.save(existing));
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Delete stylist
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStylist(@PathVariable Long id) {
        return stylistRepository.findById(id).map(existing -> {
            existing.setActive(false);
            stylistRepository.save(existing);
            return ResponseEntity.ok().<Void>build();
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }
}
