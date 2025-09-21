package org.example.bordifybackend.service;

import org.example.bordifybackend.Dto.StatsDTO;
import org.example.bordifybackend.Dto.UserInfoDTO;

import java.util.List;

public interface AdminService {
     StatsDTO getDashboardStats();
     List<UserInfoDTO> getAllUsers();
}
