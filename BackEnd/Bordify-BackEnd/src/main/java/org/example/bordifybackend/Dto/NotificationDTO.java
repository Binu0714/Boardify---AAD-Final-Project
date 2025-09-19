package org.example.bordifybackend.Dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class NotificationDTO {
    private long id;
    private String message;
    private String senderName;
    private boolean isRead;
    private LocalDateTime createdDate;

}
