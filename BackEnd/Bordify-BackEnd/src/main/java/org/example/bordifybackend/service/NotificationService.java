package org.example.bordifybackend.service;

import lombok.RequiredArgsConstructor;
import org.example.bordifybackend.Dto.NotificationDTO;
import org.example.bordifybackend.entity.BookingReq;
import org.example.bordifybackend.entity.Notification;
import org.example.bordifybackend.entity.User;
import org.example.bordifybackend.repo.NotificationRepo;
import org.example.bordifybackend.repo.UserRepo;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {
    private final NotificationRepo notificationRepo;
    private final UserRepo userRepo;

    @Transactional
    public void createNotification(User sender, User recipient, String message, BookingReq bookingReq) {
        Notification notification = Notification.builder()
                .sender(sender)
                .recipient(recipient)
                .message(message)
                .bookingReq(bookingReq)
                .isRead(false)
                .build();

        notificationRepo.save(notification);
    }

    public List<NotificationDTO> getUnreadNotifications() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepo.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Notification> notificationEntities = notificationRepo.findByRecipientAndIsReadFalse(currentUser);

        List<NotificationDTO> notificationDTOs = new ArrayList<>();
        for (Notification notification : notificationEntities) {
            User sender = notification.getSender();

            // --- THIS IS THE CHANGE ---
            // We now directly pass the createdDate from the entity to the DTO.
            NotificationDTO dto = NotificationDTO.builder()
                    .id(notification.getId())
                    .message(notification.getMessage())
                    .isRead(notification.isRead())
                    .senderName(sender.getUsername())
                    .createdDate(notification.getCreatedDate()) // Pass the raw date
                    .build();

            notificationDTOs.add(dto);
        }
        return notificationDTOs;

        // You can now DELETE the private formatTimeAgo() helper method from this service.
    }
}
