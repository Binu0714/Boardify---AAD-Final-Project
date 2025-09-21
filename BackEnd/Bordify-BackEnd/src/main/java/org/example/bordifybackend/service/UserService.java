package org.example.bordifybackend.service;

import org.example.bordifybackend.Dto.*;

public interface UserService {
     AuthResponseDTO authenticate(AuthDTO authDTO);
     String register(RegisterDTO registerDTO);
     UserDTO getByUsername(String username);
     UserDTO updateUser(String username, String email, String mobile, String profilePicUrl);
     void updatePassword(String username, String currentPassword, String newPassword, String confirmPassword);
     UserStatsDTO getUserDashboardStats();
     void deleteUser(Long id);
}
