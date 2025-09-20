package org.example.bordifybackend.controller;

import lombok.RequiredArgsConstructor;
import org.example.bordifybackend.Dto.ApiResponse;
import org.example.bordifybackend.Dto.StatsDTO;
import org.example.bordifybackend.Dto.UserInfoDTO;
import org.example.bordifybackend.service.AdminService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequiredArgsConstructor
@RequestMapping("/admin")
public class AdminController {
    private final AdminService adminService;

    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> getStats() {
        try {
            StatsDTO stats = adminService.getDashboardStats();
            return ResponseEntity.ok(
                    new ApiResponse(
                            200,
                            "Stats fetched successfully",
                            stats
                    )
            );
        } catch (Exception e) {
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

    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> getAllUsers() {
        try {
            List<UserInfoDTO> users = adminService.getAllUsers();
            return ResponseEntity.ok(
                    new ApiResponse(
                            200,
                            "Users fetched successfully",
                            users
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
}
