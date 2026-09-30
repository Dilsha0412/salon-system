package com.salon.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingEvent implements Serializable {
    private Long bookingId;
    private String customerName;
    private String customerPhone;
    private String serviceName;
    private String appointmentDate;
    private String appointmentTime;
    private String status;
    private String eventType; // CREATED, UPDATED, CANCELLED
    private String timestamp;
}
