package org.example.bordifybackend.Dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import org.example.bordifybackend.entity.Role;

@Data
@AllArgsConstructor
public class AuthResponseDTO {
    private String accessToken;
    private Role role;
}
