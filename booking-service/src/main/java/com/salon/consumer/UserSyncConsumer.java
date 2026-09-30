package com.salon.consumer;

import com.salon.config.RabbitMQConfig;
import com.salon.event.UserRegisteredEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
public class UserSyncConsumer {

    private static final Logger log = LoggerFactory.getLogger(UserSyncConsumer.class);

    @RabbitListener(queues = RabbitMQConfig.USER_SYNC_QUEUE)
    public void handleUserRegistered(UserRegisteredEvent event) {
        log.info("================================================================================");
        log.info("🐰 [RabbitMQ Event Received] User Registered Event");
        log.info("   -> User ID: {}", event.getUserId());
        log.info("   -> Name: {}", event.getFullName());
        log.info("   -> Email: {}", event.getEmail());
        log.info("   -> Phone: {}", event.getPhone());
        log.info("   -> Role: {}", event.getRole());
        log.info("   -> Syncing Customer profile into Salon Database...");
        log.info("   ✅ Customer Profile Synchronized Successfully!");
        log.info("================================================================================");
    }
}
