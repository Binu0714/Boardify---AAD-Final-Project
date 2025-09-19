package org.example.bordifybackend.service;

import lombok.RequiredArgsConstructor;
import org.example.bordifybackend.Dto.BookingRequestDTO;
import org.example.bordifybackend.entity.BookingReq;
import org.example.bordifybackend.entity.BookingStatus;
import org.example.bordifybackend.entity.Property;
import org.example.bordifybackend.entity.User;
import org.example.bordifybackend.repo.BookingRepo;
import org.example.bordifybackend.repo.PropertyRepo;
import org.example.bordifybackend.repo.UserRepo;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class BookingService {
    private final UserRepo userRepo;
    private final PropertyRepo propertyRepo;
    private final BookingRepo bookingRepo;
    private final NotificationService notificationService;

    @Transactional
    public void createBookingRequest(BookingRequestDTO requestDTO) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User seeker = userRepo.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Property property = propertyRepo.findById(requestDTO.getPropertyId())
                .orElseThrow(() -> new RuntimeException("Property not found"));

        User owner = property.getUser();

        if (seeker.equals(owner)) {
            throw new RuntimeException("You cannot book your own property");
        }

        BookingReq newBookingReq = BookingReq.builder()
                .status(BookingStatus.PENDING)
                .user(seeker)
                .property(property)
                .build();

        BookingReq savedReq = bookingRepo.save(newBookingReq);

        String messageToOwner = seeker.getUsername() + " has sent a booking request for your ad: '" + property.getTitle() + "'";

        notificationService.createNotification(seeker, owner, messageToOwner, savedReq);
    }
}
