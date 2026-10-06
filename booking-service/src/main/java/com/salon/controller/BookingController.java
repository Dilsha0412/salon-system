package com.salon.controller;

import com.salon.config.RabbitMQConfig;
import com.salon.event.BookingEvent;
import com.salon.model.Booking;
import com.salon.repository.BookingRepository;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
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

    @Autowired
    private RabbitTemplate rabbitTemplate;

    // Standard Salon Business Time Slots
    private static final List<String> ALL_DAILY_SLOTS = Arrays.asList(
            "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
            "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM",
            "05:00 PM", "06:00 PM", "07:00 PM"
    );

    private void publishBookingEvent(Booking booking, String eventType, String routingKey) {
        try {
            BookingEvent event = BookingEvent.builder()
                    .bookingId(booking.getId())
                    .customerName(booking.getCustomerName())
                    .customerPhone(booking.getCustomerPhone())
                    .serviceName(booking.getServiceName())
                    .appointmentDate(booking.getAppointmentDate())
                    .appointmentTime(booking.getAppointmentTime())
                    .status(booking.getStatus())
                    .eventType(eventType)
                    .timestamp(LocalDateTime.now().toString())
                    .build();
            rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE_NAME, routingKey, event);
        } catch (Exception e) {
            System.err.println("Could not publish BookingEvent to RabbitMQ: " + e.getMessage());
        }
    }

    // Get all bookings
    @GetMapping
    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    // Get single booking details
    @GetMapping("/{id}")
    public ResponseEntity<Booking> getBookingById(@PathVariable Long id) {
        Optional<Booking> booking = bookingRepository.findById(id);
        return booking.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Create new appointment booking
    @PostMapping
    public ResponseEntity<Booking> createBooking(@RequestBody Booking booking) {
        if (booking.getStatus() == null || booking.getStatus().isEmpty()) {
            booking.setStatus("CONFIRMED");
        }

        // Deduplication Guard: Check if an identical active booking was already registered
        if (booking.getCustomerPhone() != null && booking.getAppointmentDate() != null && booking.getAppointmentTime() != null) {
            List<Booking> customerBookings = bookingRepository.findByCustomerPhoneOrderByCreatedAtDesc(booking.getCustomerPhone());
            Optional<Booking> duplicate = customerBookings.stream()
                    .filter(b -> booking.getAppointmentDate().equals(b.getAppointmentDate())
                            && booking.getAppointmentTime().equalsIgnoreCase(b.getAppointmentTime())
                            && !"CANCELLED".equalsIgnoreCase(b.getStatus()))
                    .findFirst();

            if (duplicate.isPresent()) {
                return ResponseEntity.ok(duplicate.get());
            }
        }

        Booking savedBooking = bookingRepository.save(booking);
        publishBookingEvent(savedBooking, "CREATED", RabbitMQConfig.BOOKING_CREATED_ROUTING_KEY);
        return ResponseEntity.ok(savedBooking);
    }

    // Customer's personal booking history
    @GetMapping("/customer/{phone}")
    public List<Booking> getCustomerBookingHistory(@PathVariable String phone) {
        return bookingRepository.findByCustomerPhoneOrderByCreatedAtDesc(phone);
    }

    // Calculate and return free time slots
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

    // Update booking status (CONFIRMED, COMPLETED, CANCELLED)
    @PutMapping("/{id}/status")
    public ResponseEntity<Booking> updateBookingStatus(
            @PathVariable Long id,
            @RequestParam String status
    ) {
        return bookingRepository.findById(id).map(booking -> {
            booking.setStatus(status.toUpperCase());
            Booking updated = bookingRepository.save(booking);
            publishBookingEvent(updated, "UPDATED", RabbitMQConfig.BOOKING_UPDATED_ROUTING_KEY);
            return ResponseEntity.ok(updated);
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Cancel appointment
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancelBooking(@PathVariable Long id) {
        return bookingRepository.findById(id).map(booking -> {
            booking.setStatus("CANCELLED");
            Booking cancelled = bookingRepository.save(booking);
            publishBookingEvent(cancelled, "CANCELLED", RabbitMQConfig.BOOKING_CANCELLED_ROUTING_KEY);
            return ResponseEntity.ok().<Void>build();
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }
}
