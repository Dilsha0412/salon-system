package com.salon.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "salon_services")
public class SalonService {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String description;
    private Double price;
    private String category = "Hair Care";
    private Integer durationMinutes = 45;
    private Double rating = 4.8;
    private Integer reviewCount = 24;

    public SalonService() {}

    public SalonService(String name, String description, Double price, String category, Integer durationMinutes, Double rating, Integer reviewCount) {
        this.name = name;
        this.description = description;
        this.price = price;
        this.category = (category != null && !category.isEmpty()) ? category : "Hair Care";
        this.durationMinutes = durationMinutes != null ? durationMinutes : 45;
        this.rating = rating != null ? rating : 4.8;
        this.reviewCount = reviewCount != null ? reviewCount : 24;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public Integer getDurationMinutes() { return durationMinutes; }
    public void setDurationMinutes(Integer durationMinutes) { this.durationMinutes = durationMinutes; }

    public Double getRating() { return rating; }
    public void setRating(Double rating) { this.rating = rating; }

    public Integer getReviewCount() { return reviewCount; }
    public void setReviewCount(Integer reviewCount) { this.reviewCount = reviewCount; }
}