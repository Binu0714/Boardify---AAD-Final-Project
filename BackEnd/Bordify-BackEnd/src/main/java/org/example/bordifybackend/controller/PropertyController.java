package org.example.bordifybackend.controller;

import com.fasterxml.jackson.databind.annotation.JsonAppend;
import lombok.RequiredArgsConstructor;
import org.example.bordifybackend.Dto.ApiResponse;
import org.example.bordifybackend.Dto.BookingRequestDTO;
import org.example.bordifybackend.Dto.FilterDTO;
import org.example.bordifybackend.Dto.PropertyDTO;
import org.example.bordifybackend.entity.Property;
import org.example.bordifybackend.service.BookingService;
import org.example.bordifybackend.service.PropertyService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequiredArgsConstructor
@RequestMapping("/property")
public class PropertyController {
    private final PropertyService propertyService;

    @PostMapping("/create")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse> createProperty(
            @RequestPart("propertyData")PropertyDTO propertyDTO,
            @RequestPart("image")List<MultipartFile> images
            //can't use @RequestBody because the overall post request has files.so must sent the content-type of
            //multipart/form-data.if we use @RequestBody then it can only work with the request that have
            //content-type of application/json
    ) {

        try{
            propertyService.createProperty(propertyDTO,images);
            return ResponseEntity.ok(
                    new ApiResponse(
                            200,
                            "Property created successfully",
                            null
                    )
            );
        }catch (Exception e){
            e.printStackTrace();
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(
                            500,
                            "An unexpected error occurred: " + e.getMessage(),
                            null
                            )
                    );
        }
    }

    @GetMapping("/getAllProperties")
    public ResponseEntity<ApiResponse> getAllProperties() {
        try {
            List<PropertyDTO> properties = propertyService.getAllProperties();

            return ResponseEntity.ok(
                    new ApiResponse(
                            200,
                            "Properties fetched successfully",
                            properties
                    )
            );
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(
                            500,
                            "Failed to fetch properties",
                            null
                            )
                    );
        }
    }

    @GetMapping("/getPropertyById/{id}")
    public ResponseEntity<ApiResponse> getPropertyById(@PathVariable Long id) {
        try {
            PropertyDTO property = propertyService.getPropertyById(id);

            return ResponseEntity.ok(
                    new ApiResponse(
                            200,
                            "Property fetched successfully",
                            property
                    )
            );
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(
                            500,
                            "Failed to fetch property",
                            null
                            )
                    );
        }
    }

    @GetMapping("/myAds")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse> getMyAds() {
        try {
            List<PropertyDTO> properties = propertyService.getMyAds();

            return ResponseEntity.ok(
                    new ApiResponse(
                            200,
                            "Properties fetched successfully",
                            properties
                    )
            );
        }catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(
                            500,
                            "Failed to fetch properties",
                            null
                            )
                    );
        }
    }

    @DeleteMapping("/delete/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse> deleteProperty(@PathVariable Long id) {
        try {
            propertyService.deleteProperty(id);
            return ResponseEntity.ok(
                    new ApiResponse(
                            200,
                            "Property deleted successfully",
                            null
                    )
            );
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(
                            500,
                            "Failed to delete property",
                            null
                            )
                    );
        }
    }

    @PutMapping("/update/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse> updateProperty(
            @PathVariable Long id,
            @RequestPart("propertyData")PropertyDTO propertyDTO,
            @RequestPart(value = "image", required = false)List<MultipartFile> images
    ) {
        try {
            propertyService.updateProperty(id,propertyDTO,images);
            return ResponseEntity.ok(
                    new ApiResponse(
                            200,
                            "Property updated successfully",
                            null
                    )
            );
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(
                            500,
                            "Failed to update property",
                            null
                            )
                    );
        }
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse> searchProperties(@RequestParam("keyword") String keyword) {
        try {
            List<PropertyDTO> searchResults = propertyService.searchProperties(keyword);
            return ResponseEntity.ok(
                    new ApiResponse(
                            200,
                            "Properties found: " + searchResults.size(),
                            searchResults
                    )
            );
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse(
                                    500,
                                    "An error occurred during search: " + e.getMessage(),
                                    null
                            )
                    );
        }
    }

    @GetMapping("/cities")
    public ResponseEntity<ApiResponse> getCities() {
        List<String> cities = propertyService.getAllCities();
        return ResponseEntity.ok(
                new ApiResponse(
                        200,
                        "Cities fetched",
                        cities
                )
        );
    }

    @GetMapping("/universities")
    public ResponseEntity<ApiResponse> getUniversities() {
        List<String> universities = propertyService.getAllUniversities();
        return ResponseEntity.ok(
                new ApiResponse(
                        200,
                        "Universities fetched",
                        universities
                )
        );
    }

    @PostMapping("/filter")
    public ResponseEntity<ApiResponse> filterProperties(@RequestBody FilterDTO filters) {
        List<PropertyDTO> filteredProperties = propertyService.filterProperties(filters);
        return ResponseEntity.ok(
                new ApiResponse(
                        200,
                        "Properties filtered",
                        filteredProperties
                )
        );
    }

}
