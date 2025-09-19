package org.example.bordifybackend.repo;

import org.example.bordifybackend.entity.Notification;
import org.example.bordifybackend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NotificationRepo extends JpaRepository<Notification, Long> {
    List<Notification> findByRecipientAndIsReadFalse(User recipient);
    Optional<Notification> findByBookingReq_Id(Long bookingReqId);
}
