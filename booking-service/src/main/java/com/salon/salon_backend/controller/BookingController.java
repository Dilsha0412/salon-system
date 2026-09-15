package com.salon.controller;

import com.salon.model.Booking;
import com.salon.repository.BookingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "*")
public class BookingController {

    @Autowired
    private BookingRepository bookingRepository;

    // Standard Salon Business Time Slots (Daily: 9 AM to 8 PM)
    private static final List<String> ALL_DAILY_SLOTS = Arrays.asList(
            "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
            "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM",
            "05:00 PM", "06:00 PM", "07:00 PM"
    );

    // 1. GET /api/bookings - Get all bookings
    @GetMapping
    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    // 2. GET /api/bookings/{id} - Get single booking details
    @GetMapping("/{id}")
    public ResponseEntity<Booking> getBookingById(@PathVariable Long id) {
        Optional<Booking> booking = bookingRepository.findById(id);
        return booking.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // 3. POST /api/bookings - Create new appointment booking
    @PostMapping
    public Booking createBooking(@RequestBody Booking booking) {
        if (booking.getStatus() == null || booking.getStatus().isEmpty()) {
            booking.setStatus("CONFIRMED");
        }
        return bookingRepository.save(booking);
    }

    // 4. GET /api/bookings/customer/{phone} - Customer's personal booking history
    @GetMapping("/customer/{phone}")
    public List<Booking> getCustomerBookingHistory(@PathVariable String phone) {
        return bookingRepository.findByCustomerPhoneOrderByCreatedAtDesc(phone);
    }

    // 5. GET /api/bookings/available-slots - Calculate and return free time slots
    @GetMapping("/available-slots")
    public List<String> getAvailableSlots(
            @RequestParam String date,
            @RequestParam(required = false) Long stylistId
    ) {
        List<Booking> bookedAppointments;
        if (stylistId != null) {
            bookedAppointments = bookingRepository.findByAppointmentDateAndStylistIdAndStatusNot(date, stylistId, "CANCELLED");
        } else {
            bookedAppointments = bookingRepository.findByAppointmentDateAndStatusNot(date, "CANCELLED");
        }

        // Get set of occupied time slots
        List<String> occupiedSlots = bookedAppointments.stream()
                .map(Booking::getAppointmentTime)
                .collect(Collectors.toList());

        // Filter and return only available slots
        return ALL_DAILY_SLOTS.stream()
                .filter(slot -> !occupiedSlots.contains(slot))
                .collect(Collectors.toList());
    }

    // 6. PUT /api/bookings/{id}/status - Update booking status (CONFIRMED, COMPLETED, CANCELLED)
    @PutMapping("/{id}/status")
    public ResponseEntity<Booking> updateBookingStatus(
            @PathVariable Long id,
            @RequestParam String status
    ) {
        return bookingRepository.findById(id).map(booking -> {
            booking.setStatus(status.toUpperCase());
            return ResponseEntity.ok(bookingRepository.save(booking));
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // 7. DELETE /api/bookings/{id} - Cancel appointment
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancelBooking(@PathVariable Long id) {
        return bookingRepository.findById(id).map(booking -> {
            booking.setStatus("CANCELLED");
            bookingRepository.save(booking);
            return ResponseEntity.ok().<Void>build();
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }
}
