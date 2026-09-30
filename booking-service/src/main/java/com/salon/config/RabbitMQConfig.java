package com.salon.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String EXCHANGE_NAME = "salon.exchange";
    
    public static final String USER_SYNC_QUEUE = "booking.user.sync.queue";
    public static final String NOTIFICATION_QUEUE = "salon.notifications.queue";

    public static final String USER_REGISTERED_ROUTING_KEY = "user.registered";
    public static final String BOOKING_CREATED_ROUTING_KEY = "booking.created";
    public static final String BOOKING_UPDATED_ROUTING_KEY = "booking.updated";
    public static final String BOOKING_CANCELLED_ROUTING_KEY = "booking.cancelled";
    public static final String BOOKING_ALL_ROUTING_KEY = "booking.*";

    @Bean
    public TopicExchange salonExchange() {
        return new TopicExchange(EXCHANGE_NAME);
    }

    @Bean
    public Queue userSyncQueue() {
        return new Queue(USER_SYNC_QUEUE, true);
    }

    @Bean
    public Queue notificationQueue() {
        return new Queue(NOTIFICATION_QUEUE, true);
    }

    @Bean
    public Binding userSyncBinding(Queue userSyncQueue, TopicExchange salonExchange) {
        return BindingBuilder.bind(userSyncQueue).to(salonExchange).with(USER_REGISTERED_ROUTING_KEY);
    }

    @Bean
    public Binding notificationBinding(Queue notificationQueue, TopicExchange salonExchange) {
        return BindingBuilder.bind(notificationQueue).to(salonExchange).with(BOOKING_ALL_ROUTING_KEY);
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(jsonMessageConverter());
        return template;
    }
}
