package org.example.bordifybackend.service.impl;

import lombok.RequiredArgsConstructor;
import org.example.bordifybackend.Dto.StatsDTO;
import org.example.bordifybackend.Dto.UserInfoDTO;
import org.example.bordifybackend.entity.User;
import org.example.bordifybackend.repo.BookingRepo;
import org.example.bordifybackend.repo.PropertyRepo;
import org.example.bordifybackend.repo.UserRepo;
import org.example.bordifybackend.service.AdminService;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
    @RequiredArgsConstructor
    public class AdminServiceImpl implements AdminService {

    private final UserRepo userRepo;
    private final PropertyRepo propertyRepo;
    private final BookingRepo bookingRepo;


    public StatsDTO getDashboardStats() {
        long totalUsers = userRepo.count();
        long totalListings = propertyRepo.count();
        long availableListings = propertyRepo.countByAvailabilityTrue();
        long bookedListings = propertyRepo.countByAvailabilityFalse(); // Assuming 'false' means booked

        return new StatsDTO(totalUsers, totalListings, availableListings, bookedListings);
    }

        public List<UserInfoDTO> getAllUsers() {
            List<User> allUsers = userRepo.findAll();

            List<UserInfoDTO> userInfoDTOS = new ArrayList<>();

            for (User user : allUsers) {
                UserInfoDTO dto = UserInfoDTO.builder()
                        .id(user.getId())
                        .username(user.getUsername())
                        .email(user.getEmail())
                        .mobile(user.getMobile())
                        .role(user.getRole())
                        .profilePicUrl(user.getProfilePicUrl())
                        .build();

                userInfoDTOS.add(dto);
            }
            return userInfoDTOS;
        }
}
