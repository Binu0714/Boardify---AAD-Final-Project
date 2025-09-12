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

        if (propertyDTO.getAmenityIds() != null && !propertyDTO.getAmenityIds().isEmpty()) {

            Set<Long> ids = new HashSet<>();
            for (Long id : propertyDTO.getAmenityIds()) {
                if (id != null) ids.add(id);
            }

            if (!ids.isEmpty()) {
                List<Amenity> amenitiesList = amenityRepo.findAllById(ids);
                Set<Amenity> amenities = new HashSet<>(amenitiesList);
                property.setAmenities(amenities);

                for (Amenity amenity : amenities) {
                    amenity.getProperties().add(property);
                }
            }
        }

        if (images != null && !images.isEmpty()) {
            List<Photo> photoEntities = images.stream()
                    .map(file -> {
                        String imageUrl = imgbbService.upload(file);
                        return Photo.builder()
                                .photoUrl(imageUrl)
                                .property(property)
                                .build();
                    })
                    .toList();
            property.setPhotos(photoEntities);
        }

        return propertyRepo.save(property);
    }
}
