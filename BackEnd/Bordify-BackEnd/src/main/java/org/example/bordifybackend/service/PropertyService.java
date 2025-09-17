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

import java.io.IOException;
import java.util.ArrayList;
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

    public List<PropertyDTO> getAllProperties() {
        List<Property> allProperties = propertyRepo.findAll();

        List<PropertyDTO> propertyDTOS = new ArrayList<>();

        for (Property property : allProperties) {
            PropertyDTO dto = new PropertyDTO();

            dto.setId(property.getPropertyId());
            dto.setTitle(property.getTitle());
            dto.setAvailability(property.isAvailability());
            dto.setDescription(property.getDescription());
            dto.setPrice(property.getPrice());
            dto.setPropertyType(property.getType());
            dto.setListedFor(property.getListedFor());
            dto.setNoOfBeds(property.getNoOfBeds());
            dto.setNoOfBaths(property.getNoOfBaths());
            dto.setNearestCampus(property.getNearestCampus());

            if (property.getLocation() != null) {
                dto.setCity(property.getLocation().getCity());
                dto.setDistrict(property.getLocation().getDistrict());
                dto.setAddress(property.getLocation().getAddress());
                dto.setLatitude(property.getLocation().getLatitude());
                dto.setLongitude(property.getLocation().getLongitude());
            }

            if (property.getAmenities() != null && !property.getAmenities().isEmpty()) {
                Set<Long> amenityIds = property.getAmenities().stream()
                        .map(Amenity::getId)
                        .collect(Collectors.toSet());
                dto.setAmenityIds(amenityIds);
            }

            if (property.getPhotos() != null && !property.getPhotos().isEmpty()) {
                List<String> photoUrls = property.getPhotos().stream()
                        .map(Photo::getPhotoUrl)
                        .collect(Collectors.toList());
                dto.setPhotoUrls(photoUrls);
            }

            propertyDTOS.add(dto);
        }
        return propertyDTOS;
    }

    public PropertyDTO getPropertyById(Long id) {
        Property property = propertyRepo.findById(id).orElse(null);

        if (property == null) {
            throw new RuntimeException("Property not found");
        }

        PropertyDTO propertyDTO = new PropertyDTO();

        propertyDTO.setId(property.getPropertyId());
        propertyDTO.setTitle(property.getTitle());
        propertyDTO.setAvailability(property.isAvailability());
        propertyDTO.setDescription(property.getDescription());
        propertyDTO.setPrice(property.getPrice());
        propertyDTO.setPropertyType(property.getType());
        propertyDTO.setListedFor(property.getListedFor());
        propertyDTO.setNoOfBeds(property.getNoOfBeds());
        propertyDTO.setNoOfBaths(property.getNoOfBaths());
        propertyDTO.setNearestCampus(property.getNearestCampus());

        if (property.getLocation() != null) {
            propertyDTO.setCity(property.getLocation().getCity());
            propertyDTO.setDistrict(property.getLocation().getDistrict());
            propertyDTO.setAddress(property.getLocation().getAddress());
            propertyDTO.setLatitude(property.getLocation().getLatitude());
            propertyDTO.setLongitude(property.getLocation().getLongitude());
        }

        if (property.getAmenities() != null && !property.getAmenities().isEmpty()) {
            Set<Long> amenityIds = property.getAmenities().stream()
                    .map(Amenity::getId)
                    .collect(Collectors.toSet());
            propertyDTO.setAmenityIds(amenityIds);
        }

        if (property.getPhotos() != null && !property.getPhotos().isEmpty()) {
            List<String> photoUrls = property.getPhotos().stream()
                    .map(Photo::getPhotoUrl)
                    .collect(Collectors.toList());
            propertyDTO.setPhotoUrls(photoUrls);
        }

        if(property.getUser() != null) {
            propertyDTO.setOwnerName(property.getUser().getUsername());
            propertyDTO.setOwnerContact(property.getUser().getMobile());
        }

        return propertyDTO;
    }

    public List<PropertyDTO> getMyAds() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        List<Property> properties = propertyRepo.findByUserUsername(username);

        List<PropertyDTO> propertyDTOs = new ArrayList<>();
        for (Property property : properties) {
            PropertyDTO dto = new PropertyDTO();
            dto.setId(property.getPropertyId());
            dto.setTitle(property.getTitle());
            dto.setAvailability(property.isAvailability());
            dto.setDescription(property.getDescription());
            dto.setPrice(property.getPrice());
            dto.setPropertyType(property.getType());
            dto.setListedFor(property.getListedFor());
            dto.setNoOfBeds(property.getNoOfBeds());
            dto.setNoOfBaths(property.getNoOfBaths());
            dto.setNearestCampus(property.getNearestCampus());

            if (property.getAmenities() != null && !property.getAmenities().isEmpty()) {
                Set<Long> amenityIds = property.getAmenities().stream()
                        .map(Amenity::getId)
                        .collect(Collectors.toSet());
                dto.setAmenityIds(amenityIds);
            }

            if (property.getLocation() != null) {
                dto.setCity(property.getLocation().getCity());
                dto.setDistrict(property.getLocation().getDistrict());
                dto.setAddress(property.getLocation().getAddress());
                dto.setLatitude(property.getLocation().getLatitude());
                dto.setLongitude(property.getLocation().getLongitude());
            }

            if (property.getPhotos() != null && !property.getPhotos().isEmpty()) {
                List<String> photoUrls = property.getPhotos().stream()
                        .map(Photo::getPhotoUrl)
                        .collect(Collectors.toList());
                dto.setPhotoUrls(photoUrls);
            }

            propertyDTOs.add(dto);
        }
        return propertyDTOs;
    }

    public void deleteProperty(Long id) {
        propertyRepo.deleteById(id);
    }

    @Transactional
    public void updateProperty(Long id, PropertyDTO propertyDTO, List<MultipartFile> images) {
        Property property = propertyRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Property not found"));

        property.setTitle(propertyDTO.getTitle());
        property.setDescription(propertyDTO.getDescription());
        property.setPrice(propertyDTO.getPrice());
        property.setType(propertyDTO.getPropertyType());
        property.setListedFor(propertyDTO.getListedFor());
        property.setNoOfBeds(propertyDTO.getNoOfBeds());
        property.setNoOfBaths(propertyDTO.getNoOfBaths());
        property.setNearestCampus(propertyDTO.getNearestCampus());
        property.setAvailability(propertyDTO.isAvailability());

        Location location = property.getLocation();
        if (location == null) {
            location = new Location();
            property.setLocation(location);
            location.setProperty(property);
        }
        location.setAddress(propertyDTO.getAddress());
        location.setCity(propertyDTO.getCity());
        location.setDistrict(propertyDTO.getDistrict());
        location.setLatitude(propertyDTO.getLatitude());
        location.setLongitude(propertyDTO.getLongitude());

        if (propertyDTO.getAmenityIds() != null && !propertyDTO.getAmenityIds().isEmpty()) {
            Set<Long> ids = propertyDTO.getAmenityIds().stream()
                    .filter(idVal -> idVal != null)
                    .collect(Collectors.toSet());

            if (!ids.isEmpty()) {
                List<Amenity> amenitiesList = amenityRepo.findAllById(ids);
                Set<Amenity> amenities = new HashSet<>(amenitiesList);
                property.setAmenities(amenities);

                for (Amenity amenity : amenities) {
                    amenity.getProperties().add(property);
                }
            }
        } else {
            property.setAmenities(new HashSet<>());
        }

        if (images != null && !images.isEmpty()) {
            if (property.getPhotos() != null) {
                property.getPhotos().clear();
            } else {
                property.setPhotos(new ArrayList<>());
            }

            List<Photo> photoEntities = images.stream()
                    .map(file -> {
                        String imageUrl = imgbbService.upload(file);
                        return Photo.builder()
                                .photoUrl(imageUrl)
                                .property(property)
                                .build();
                    })
                    .toList();
            property.getPhotos().addAll(photoEntities);
        }

        propertyRepo.save(property);
    }

}
