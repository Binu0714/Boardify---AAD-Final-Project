package org.example.bordifybackend.controller;

import lombok.RequiredArgsConstructor;
import org.example.bordifybackend.Dto.ApiResponse;
import org.example.bordifybackend.Dto.NotificationDTO;
import org.example.bordifybackend.service.impl.NotificationServiceImpl;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequiredArgsConstructor
@RequestMapping("/notification")
public class NotificationController {
    private final NotificationServiceImpl notificationService;

    @GetMapping("/unread")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse> getUnreadNotifications() {
        List<NotificationDTO> notifications = notificationService.getUnreadNotifications();
        return ResponseEntity.ok(
                new ApiResponse(
                        200,
                        "Unread notifications fetched",
                        notifications
        ));
    }

    @GetMapping("/markAsRead")
    public ResponseEntity<ApiResponse> getUnreadAndMarkAsRead() {
        List<NotificationDTO> notifications = notificationService.getUnreadAndMarkAsRead();
        return ResponseEntity.ok(
                new ApiResponse(
                        200,
                        "Unread notifications fetched",
                        notifications
        ));
    }


}
