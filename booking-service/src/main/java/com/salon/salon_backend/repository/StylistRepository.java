package com.salon.repository;

import com.salon.model.Stylist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StylistRepository extends JpaRepository<Stylist, Long> {
    List<Stylist> findByActiveTrue();
}
