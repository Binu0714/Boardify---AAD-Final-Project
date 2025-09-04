package org.example.bordifybackend.controller;

import lombok.RequiredArgsConstructor;
import org.example.bordifybackend.Dto.ApiResponse;
import org.example.bordifybackend.Dto.AuthDTO;
import org.example.bordifybackend.Dto.RegisterDTO;
import org.example.bordifybackend.Dto.UserDTO;
import org.example.bordifybackend.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*")
@RestController
@RequiredArgsConstructor
@RequestMapping("/user")
public class UserController {
    private final UserService userService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse> registerUser(@RequestBody RegisterDTO registerDTO) {
        return ResponseEntity.ok(
                new ApiResponse(
                        200,
                        "User registered successfully",
                        userService.register(registerDTO)
                )
        );
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse> login(@RequestBody AuthDTO authDTO) {
        return ResponseEntity.ok(
                new ApiResponse(
                        200,
                        "User logged in successfully",
                        userService.authenticate(authDTO)
                )
        );
    }

    @GetMapping("/current")
    public ResponseEntity<ApiResponse> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();

        UserDTO userDTO = userService.getByUsername(username);

        return ResponseEntity.ok(
                new ApiResponse(
                        200,
                        "User fetched successfully",
                        userDTO
                )
        );
    }

}
