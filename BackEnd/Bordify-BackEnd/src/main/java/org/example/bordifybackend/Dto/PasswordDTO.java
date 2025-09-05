package org.example.bordifybackend.Dto;

import lombok.Data;

@Data
public class PasswordDTO {
    private String currentPassword;
    private String newPassword;
    private String confirmPassword;
}
