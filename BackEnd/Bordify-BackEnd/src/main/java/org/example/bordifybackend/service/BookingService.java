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

    @Transactional
    public BookingReq submitBookingRequest(BookingRequestDTO requestDTO) {
        User currentUser = userRepo.findByUsername(SecurityContextHolder.getContext().getAuthentication().getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Property property = propertyRepo.findById(requestDTO.getPropertyId())
                .orElseThrow(() -> new RuntimeException("Property not found"));

        BookingReq newBookingReq = BookingReq.builder()
                .status(BookingStatus.PENDING)
                .user(currentUser)
                .property(property)
                .build();

        return bookingRepo.save(newBookingReq);
    }
}
