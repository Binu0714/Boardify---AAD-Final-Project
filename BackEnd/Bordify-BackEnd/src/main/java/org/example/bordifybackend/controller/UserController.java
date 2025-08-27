package org.example.bordifybackend.controller;

import lombok.RequiredArgsConstructor;
import org.example.bordifybackend.Dto.ApiResponse;
import org.example.bordifybackend.Dto.RegisterDTO;
import org.example.bordifybackend.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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

}
