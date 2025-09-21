package org.example.bordifybackend.service;

import org.example.bordifybackend.Dto.BookingRequestDTO;

public interface BookingService {
     void createBookingRequest(BookingRequestDTO requestDTO);
     void acceptBookingRequest(Long bookingId);
     void declineBookingRequest(long id);
}
