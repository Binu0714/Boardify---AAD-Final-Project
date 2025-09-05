package org.example.bordifybackend.service;

import lombok.RequiredArgsConstructor;
import org.example.bordifybackend.Dto.AuthDTO;
import org.example.bordifybackend.Dto.AuthResponseDTO;
import org.example.bordifybackend.Dto.RegisterDTO;
import org.example.bordifybackend.Dto.UserDTO;
import org.example.bordifybackend.entity.Role;
import org.example.bordifybackend.entity.User;
import org.example.bordifybackend.repo.UserRepo;
import org.example.bordifybackend.util.JwtUtil;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepo userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthResponseDTO authenticate(AuthDTO authDTO){
        // validate credentials
        User user=userRepository.findByUsername(authDTO.getUsername())
                .orElseThrow(()->new RuntimeException("User not found"));
        // check password
        if (!passwordEncoder.matches(
                authDTO.getPassword(),
                user.getPassword())){
            throw new BadCredentialsException("Invalid credentials");
        }
        // generate token
        String token=jwtUtil.generateToken(authDTO.getUsername(), user.getRole());
        return new AuthResponseDTO(token);
    }

    // register user
    public String register(RegisterDTO registerDTO){
        if (userRepository.findByUsername(registerDTO.getUsername())
                .isPresent()){
            throw new RuntimeException("Username already exists");
        }
        User user=User.builder()
                .username(registerDTO.getUsername())
                .password(passwordEncoder.encode(registerDTO.getPassword()))
                .email(registerDTO.getEmail())
                .role(Role.valueOf(registerDTO.getRole()))
                .mobile(registerDTO.getMobile())
                .profilePicUrl(null)
                .build();
        userRepository.save(user);
        return "User registered successfully";
    }

    public UserDTO getByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return new UserDTO(
                user.getUsername(),
                user.getEmail(),
                user.getMobile(),
                user.getRole(),
                user.getProfilePicUrl()
        );
    }

    public UserDTO updateUser(String username, String email, String mobile, String profilePicUrl) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setEmail(email);
        user.setMobile(mobile);

        if (profilePicUrl != null) {
            user.setProfilePicUrl(profilePicUrl);
        }

        userRepository.save(user);

        return new UserDTO(
                user.getUsername(),
                user.getEmail(),
                user.getMobile(),
                user.getRole(),
                user.getProfilePicUrl()
        );
    }

    public void updatePassword(String username, String currentPassword, String newPassword, String confirmPassword) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new RuntimeException("Invalid current password");
        }

        if (!newPassword.equals(confirmPassword)) {
            throw new RuntimeException("New password and confirm password do not match");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }
}
