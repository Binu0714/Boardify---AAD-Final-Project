package org.example.bordifybackend.service;

import org.example.bordifybackend.Dto.NotificationDTO;
import org.example.bordifybackend.entity.BookingReq;
import org.example.bordifybackend.entity.User;

import java.util.List;

public interface NotificationService {
     void createNotification(User sender, User recipient, String message, BookingReq bookingReq);
     List<NotificationDTO> getUnreadNotifications();
     List<NotificationDTO> getUnreadAndMarkAsRead();
}
