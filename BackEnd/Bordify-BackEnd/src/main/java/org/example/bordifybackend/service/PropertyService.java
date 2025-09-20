package org.example.bordifybackend.service;

import lombok.RequiredArgsConstructor;
import org.example.bordifybackend.Dto.BookingRequestDTO;
import org.example.bordifybackend.Dto.FilterDTO;
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
import java.math.BigDecimal;
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
    private final SmsService smsService;
    private final PhoneNumberService phoneNumberService;

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

        if (property.isVerified() && property.isAvailability()) {
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
        }
        return propertyDTOS;
    }

    public PropertyDTO getPropertyById(Long id) {
        Property property = propertyRepo.findById(id).orElse(null);

        if (property == null) {
            throw new RuntimeException("Property not found");
        }

        return mapToPropertyDTO(property);

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

    public List<PropertyDTO> searchProperties(String keyword) {
        // 1. Call the custom query method in your repository
        List<Property> foundProperties = propertyRepo.searchProperties(keyword);

        // 2. Create an empty list to hold the results that will be sent to the frontend
        List<PropertyDTO> propertyDTOs = new ArrayList<>();

        // 3. Loop through each Property entity found by the search
        for (Property property : foundProperties) {
            // For each entity, create and populate a new DTO
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

            // 4. Add the fully populated DTO to our results list
            propertyDTOs.add(dto);
        }

        // 5. Return the final list of DTOs
        return propertyDTOs;
    }

    public List<String> getAllCities() {
        return propertyRepo.findDistinctCities();
    }

    public List<String> getAllUniversities() {
        return propertyRepo.findDistinctUniversities();
    }

    public List<PropertyDTO> filterProperties(FilterDTO filters) {

        List<Property> allProperties = propertyRepo.findAll();

        List<Property> filteredList = allProperties.stream()

                .filter(property -> filters.getLocation() == null || filters.getLocation().equals("Any") ||
                        (property.getLocation() != null && property.getLocation().getCity().equals(filters.getLocation())))

                .filter(property -> filters.getUniversity() == null || filters.getUniversity().equals("Any") ||
                        (property.getNearestCampus() != null && property.getNearestCampus().equals(filters.getUniversity())))

                .filter(property -> filters.getListedFor() == null || filters.getListedFor().equals("ANYONE") ||
                        (property.getListedFor() != null && property.getListedFor().name().equals(filters.getListedFor())))

                .filter(property -> filters.getPropertyType() == null || filters.getPropertyType().equals("any") ||
                        (property.getType() != null && property.getType().name().equals(filters.getPropertyType())))

                .filter(property -> filters.getMinPrice() == null ||
                        property.getPrice().compareTo(BigDecimal.valueOf(filters.getMinPrice())) >= 0)

                .filter(property -> filters.getMaxPrice() == null ||
                        property.getPrice().compareTo(BigDecimal.valueOf(filters.getMaxPrice())) <= 0)

                .filter(property -> {
                    if (filters.getBedrooms() == null || filters.getBedrooms().equals("any")) {
                        return true; // Keep if "any"
                    }
                    if ("4+".equals(filters.getBedrooms())) {
                        return property.getNoOfBeds() >= 4; // Special case for "4+"
                    }

                    return property.getNoOfBeds() == Integer.parseInt(filters.getBedrooms());
                })

                .filter(property -> {
                    if (filters.getBathrooms() == null || filters.getBathrooms().equals("any")) {
                        return true; // Keep if "any"
                    }
                    if ("3+".equals(filters.getBathrooms())) {
                        return property.getNoOfBaths() >= 3; // Special case for "3+"
                    }
                    return property.getNoOfBaths() == Integer.parseInt(filters.getBathrooms());
                })

                .filter(property -> {
                    if (filters.getBillsIncluded() == null) {
                        return true; // Keep if "any" or not specified
                    }
                    long billsIncludedAmenityId = 4L;
                    boolean hasAmenity = property.getAmenities().stream()
                            .anyMatch(amenity -> amenity.getId().equals(billsIncludedAmenityId));

                    return filters.getBillsIncluded() == hasAmenity;
                })

                .collect(Collectors.toList());

        return filteredList.stream()
                .map(this::mapToPropertyDTO)
                .collect(Collectors.toList());
    }

    private PropertyDTO mapToPropertyDTO(Property property) {
        PropertyDTO dto = new PropertyDTO();

        dto.setId(property.getPropertyId());
        dto.setTitle(property.getTitle());
        dto.setAvailability(property.isAvailability());
        dto.setVerified(property.isVerified());
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

        if (property.getUser() != null) {
            dto.setOwnerName(property.getUser().getUsername());
            dto.setOwnerContact(property.getUser().getMobile());
        }

        return dto;
    }

    public List<PropertyDTO> getUnverifiedProperties() {
        List<Property> unverifiedProperties = propertyRepo.findAllByVerifiedFalse();

        return unverifiedProperties.stream()
                .map(this::mapToPropertyDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public void approveProperty(Long id) {
        Property property = propertyRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Property not found with id : " + id));

        property.setVerified(true);
        propertyRepo.save(property);

        User owner = property.getUser();
        if (owner != null && owner.getMobile() != null && !owner.getMobile().isEmpty()) {

            String e164Number = phoneNumberService.formatToE164(owner.getMobile(), "LK");

            if (e164Number != null) {
                String messageBody = String.format(
                        "Boardify: Congratulations, %s! Your ad '%s' has been approved and is now live.",
                        owner.getUsername(),
                        property.getTitle()
                );

                smsService.sendSms(e164Number, messageBody);
            }
        }
    }

    public void rejectProperty(Long id) {
        Property property = propertyRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Property not found with id : " + id));

        User owner = property.getUser();
        if (owner != null && owner.getMobile() != null && !owner.getMobile().isEmpty()) {

            String e164Number = phoneNumberService.formatToE164(owner.getMobile(), "LK");

            if (e164Number != null) {
                String messageBody = String.format(
                        "Boardify: Update on your ad '%s'. It was rejected as it did not meet our guidelines. Please feel free to resubmit.",
                        property.getTitle()
                );
                smsService.sendSms(e164Number, messageBody);
            }
        }

        propertyRepo.deleteById(id);
    }
}