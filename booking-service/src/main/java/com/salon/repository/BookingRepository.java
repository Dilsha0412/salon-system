package com.salon.repository;

import com.salon.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    
    // Find customer booking history
    List<Booking> findByCustomerPhoneOrderByCreatedAtDesc(String customerPhone);

    // Find bookings by date
    List<Booking> findByAppointmentDate(String appointmentDate);

    // Find active bookings by date and stylist
    List<Booking> findByAppointmentDateAndStylistIdAndStatusNot(String appointmentDate, Long stylistId, String status);

    // Find active bookings by date
    List<Booking> findByAppointmentDateAndStatusNot(String appointmentDate, String status);
}
