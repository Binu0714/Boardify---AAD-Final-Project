package org.example.bordifybackend.service;

import lombok.RequiredArgsConstructor;
import org.example.bordifybackend.Dto.PropertyDTO;
import org.example.bordifybackend.entity.*;
import org.example.bordifybackend.repo.AmenityRepo;
import org.example.bordifybackend.repo.PropertyRepo;
import org.example.bordifybackend.repo.UserRepo;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PropertyService {
    private final PropertyRepo propertyRepo;
    private final UserRepo userRepo;
    private final AmenityRepo amenityRepo;
    private final ImgbbService imgbbService;

    @Transactional
    public Property createProperty(PropertyDTO propertyDTO, List<MultipartFile> images) {
        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();

        User currentUser = userRepo.findByUsername(currentUsername)
                .orElseThrow(() -> new RuntimeException("Authenticated user '" + currentUsername + "' not found."));

        Location location = Location.builder()
                .address(propertyDTO.getAddress())
                .city(propertyDTO.getCity())
                .district(propertyDTO.getDistrict())
                .latitude(propertyDTO.getLatitude())
                .longitude(propertyDTO.getLongitude())
                .build();

        Property property = Property.builder()
                .title(propertyDTO.getTitle())
                .description(propertyDTO.getDescription())
                .price(propertyDTO.getPrice())
                .type(PropertyType.valueOf(String.valueOf(propertyDTO.getPropertyType())))
                .listedFor(ListedFor.valueOf(String.valueOf(propertyDTO.getListedFor())))
                .noOfBeds(propertyDTO.getNoOfBeds())
                .noOfBaths(propertyDTO.getNoOfBaths())
                .location(location)
                .user(currentUser)
                .build();

        location.setProperty(property);

        if (propertyDTO.getAmenityIds() != null && !propertyDTO.getAmenityIds().isEmpty()) {
            Set<Amenity> amenities = new HashSet<>(amenityRepo.findAllById(propertyDTO.getAmenityIds()));
            property.setAmenities(amenities);
        }

        if (images != null && !images.isEmpty()) {
            List<Photo> photoEntities = images.stream().map(file -> {
                String imageUrl = imgbbService.upload(file); // Upload to ImgBB

                return Photo.builder()
                        .photoUrl(imageUrl) // Store the URL
                        .property(property) // Link back to the property
                        .build();
            }).collect(Collectors.toList());

            property.setPhotos(photoEntities);
        }

        return propertyRepo.save(property);
    }
}
