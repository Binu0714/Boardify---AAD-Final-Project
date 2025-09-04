package org.example.bordifybackend.Dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.bordifybackend.entity.Role;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserDTO {
    private String username;
    private String email;
    private String mobile;
    private Role role;
    private String profilePicUrl;
}
