package org.example.bordifybackend.controller;

import jakarta.servlet.annotation.MultipartConfig;
import lombok.RequiredArgsConstructor;
import org.example.bordifybackend.Dto.*;
import org.example.bordifybackend.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;

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

    @PutMapping("/update")
    public ResponseEntity<ApiResponse> updateUser(
            @RequestParam("email") String email,
            @RequestParam("mobile") String mobile,
            @RequestParam(value = "file", required = false) MultipartFile file
        ) {

        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        String profilePicUrl = null;

        if (file != null && !file.isEmpty()) {
            try {
                // Save files in project root /uploads folder
                String uploadDir = System.getProperty("user.dir") + "/uploads";
                File folder = new File(uploadDir);
                if (!folder.exists()) folder.mkdirs();

                String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
                File destination = new File(folder, fileName);
                file.transferTo(destination);

                profilePicUrl = "/uploads/" + fileName;

            } catch (Exception e) {
                e.printStackTrace();
                return ResponseEntity.status(500)
                        .body(new ApiResponse(
                                500,
                                "File upload failed",
                                null
                                )
                        );
            }
        }

        UserDTO updatedUser = userService.updateUser(username, email, mobile, profilePicUrl);

        return ResponseEntity.ok(
                new ApiResponse(
                        200,
                        "Profile updated successfully",
                        updatedUser
                )
        );
    }

    @PutMapping("/updatePassword")
    public ResponseEntity<ApiResponse> updatePassword(@RequestBody PasswordDTO dto){
        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        try {
            userService.updatePassword(username, dto.getCurrentPassword(), dto.getNewPassword(), dto.getConfirmPassword());
            return ResponseEntity.ok(
                    new ApiResponse(
                            200,
                            "Password updated successfully",
                            null
                    )
            );
        } catch (RuntimeException ex) {
            return ResponseEntity
                    .badRequest()
                    .body(
                            new ApiResponse(
                                    400,
                                    ex.getMessage(),
                                    null
                            )
                    );
        }
    }

    @GetMapping("/stats")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse> getDashboardStats(){
        try{
            UserStatsDTO stats = userService.getUserDashboardStats();
            return ResponseEntity.ok(
                    new ApiResponse(
                            200,
                            "Stats fetched successfully",
                            stats
                    )
            );
        }catch (Exception e){
            e.printStackTrace();
            return ResponseEntity
                    .status(500)
                    .body(new ApiResponse(
                            500,
                            "An unexpected error occurred: " + e.getMessage(),
                            null
                    ));
        }

    }

}
