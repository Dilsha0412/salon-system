package com.salon.consumer;

import com.salon.config.RabbitMQConfig;
import com.salon.event.BookingEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
public class NotificationConsumer {

    private static final Logger log = LoggerFactory.getLogger(NotificationConsumer.class);

    @RabbitListener(queues = RabbitMQConfig.NOTIFICATION_QUEUE)
    public void handleBookingNotification(BookingEvent event) {
        log.info("================================================================================");
        log.info("🐰 [RabbitMQ Event Received] Booking Event: {}", event.getEventType());
        log.info("   -> Booking ID: #{}", event.getBookingId());
        log.info("   -> Customer: {} ({})", event.getCustomerName(), event.getCustomerPhone());
        log.info("   -> Service: {}", event.getServiceName());
        log.info("   -> Schedule: {} at {}", event.getAppointmentDate(), event.getAppointmentTime());
        log.info("   -> Status: {}", event.getStatus());

        if ("CREATED".equalsIgnoreCase(event.getEventType())) {
            log.info("   📨 [DISPATCH] Sending SMS & Email Confirmation to {}", event.getCustomerPhone());
            log.info("   ✨ Notification: 'Dear {}, your appointment for {} on {} at {} is CONFIRMED!'",
                    event.getCustomerName(), event.getServiceName(), event.getAppointmentDate(), event.getAppointmentTime());
        } else if ("CANCELLED".equalsIgnoreCase(event.getEventType())) {
            log.info("   ⚠️ [DISPATCH] Sending Cancellation Alert to {}", event.getCustomerPhone());
            log.info("   ✨ Notification: 'Dear {}, your appointment #{} has been CANCELLED.'",
                    event.getCustomerName(), event.getBookingId());
        } else {
            log.info("   ℹ️ [DISPATCH] Status Update Notification sent for Booking #{}", event.getBookingId());
        }
        log.info("================================================================================");
    }
}
