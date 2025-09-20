package org.example.bordifybackend.controller;

import lombok.RequiredArgsConstructor;
import org.example.bordifybackend.Dto.ApiResponse;
import org.example.bordifybackend.Dto.BookingRequestDTO;
import org.example.bordifybackend.service.BookingService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*")
@RestController
@RequiredArgsConstructor
@RequestMapping("/booking")
public class BookingController {
    private final BookingService bookingService;

    @PostMapping("/request")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse> submitBookingRequest(@RequestBody BookingRequestDTO requestDTO) {
        try {
            bookingService.createBookingRequest(requestDTO);
            return ResponseEntity.ok(
                    new ApiResponse(
                            200,
                            "Booking request submitted successfully",
                            null
                    )
            );
        }catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(
                            500,
                            "An unexpected error occurred: " + e.getMessage(),
                            null
                    ));
        }
    }

    @PostMapping("/accept/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse> acceptBookingRequest(@PathVariable long id){
        try {
            bookingService.acceptBookingRequest(id);
            return ResponseEntity.ok(
                    new ApiResponse(
                            200,
                            "Booking request accepted successfully",
                            null
                    )
            );
        }catch (Exception e){
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(
                            500,
                            "An unexpected error occurred when accept the request: " + e.getMessage(),
                            null
                    ));
        }
    }

    @PostMapping("/decline/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse> declineBookingRequest(@PathVariable long id){
        try {
            bookingService.declineBookingRequest(id);
            return ResponseEntity.ok(
                    new ApiResponse(
                            200,
                            "Booking request declined successfully",
                            null
                    )
            );
        }catch (Exception e){
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(
                            500,
                            "An unexpected error occurred when decline the request: " + e.getMessage(),
                            null
                    ));
        }
    }

}
