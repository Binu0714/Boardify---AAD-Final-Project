package org.example.bordifybackend.Dto;

import lombok.Builder;
import lombok.Data;
import org.example.bordifybackend.entity.Role;

@Data
@Builder
public class UserInfoDTO {
    private long id;
    private String username;
    private String email;
    private String mobile;
    private Role role;
    private String profilePicUrl;
}
