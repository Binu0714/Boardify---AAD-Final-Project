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
        User currentUser = userRepo.findByUsername(
                SecurityContextHolder.getContext().getAuthentication().getName()
        ).orElseThrow(() -> new RuntimeException("User not found"));

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
                .type(propertyDTO.getPropertyType())
                .listedFor(propertyDTO.getListedFor())
                .noOfBeds(propertyDTO.getNoOfBeds())
                .noOfBaths(propertyDTO.getNoOfBaths())
                .nearestCampus(propertyDTO.getNearestCampus())
                .availability(true)
                .location(location)
                .user(currentUser)
                .build();

        location.setProperty(property);

        Property savedProperty = propertyRepo.save(property);

        if (propertyDTO.getAmenityIds() != null && !propertyDTO.getAmenityIds().isEmpty()) {
            Set<Amenity> amenities = new HashSet<>(amenityRepo.findAllById(propertyDTO.getAmenityIds()));
            savedProperty.setAmenities(amenities);
        }

        if (images != null && !images.isEmpty()) {
            List<Photo> photoEntities = images.stream().map(file -> {
                String imageUrl = imgbbService.upload(file);
                return Photo.builder().photoUrl(imageUrl).property(savedProperty).build();
            }).collect(Collectors.toList());
            savedProperty.setPhotos(photoEntities);
        }

        return propertyRepo.save(savedProperty);
    }
}
