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

        return mapToPropertyDTO(property);


//        PropertyDTO propertyDTO = new PropertyDTO();
//
//        propertyDTO.setId(property.getPropertyId());
//        propertyDTO.setTitle(property.getTitle());
//        propertyDTO.setAvailability(property.isAvailability());
//        propertyDTO.setDescription(property.getDescription());
//        propertyDTO.setPrice(property.getPrice());
//        propertyDTO.setPropertyType(property.getType());
//        propertyDTO.setListedFor(property.getListedFor());
//        propertyDTO.setNoOfBeds(property.getNoOfBeds());
//        propertyDTO.setNoOfBaths(property.getNoOfBaths());
//        propertyDTO.setNearestCampus(property.getNearestCampus());
//
//        if (property.getLocation() != null) {
//            propertyDTO.setCity(property.getLocation().getCity());
//            propertyDTO.setDistrict(property.getLocation().getDistrict());
//            propertyDTO.setAddress(property.getLocation().getAddress());
//            propertyDTO.setLatitude(property.getLocation().getLatitude());
//            propertyDTO.setLongitude(property.getLocation().getLongitude());
//        }
//
//        if (property.getAmenities() != null && !property.getAmenities().isEmpty()) {
//            Set<Long> amenityIds = property.getAmenities().stream()
//                    .map(Amenity::getId)
//                    .collect(Collectors.toSet());
//            propertyDTO.setAmenityIds(amenityIds);
//        }
//
//        if (property.getPhotos() != null && !property.getPhotos().isEmpty()) {
//            List<String> photoUrls = property.getPhotos().stream()
//                    .map(Photo::getPhotoUrl)
//                    .collect(Collectors.toList());
//            propertyDTO.setPhotoUrls(photoUrls);
//        }
//
//        if (property.getUser() != null) {
//            propertyDTO.setOwnerName(property.getUser().getUsername());
//            propertyDTO.setOwnerContact(property.getUser().getMobile());
//        }
//
//        return propertyDTO;
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

        // 1. Get ALL properties from the database.
        List<Property> allProperties = propertyRepo.findAll();

        // 2. Start the filtering chain using Java Streams.
        List<Property> filteredList = allProperties.stream()

                // --- Filter by Location (City) ---
                // Keeps the property if no location filter is applied OR if the city matches.
                .filter(property -> filters.getLocation() == null || filters.getLocation().equals("Any") ||
                        (property.getLocation() != null && property.getLocation().getCity().equals(filters.getLocation())))

                // --- Filter by University ---
                // Keeps the property if no university filter is applied OR if the campus matches.
                .filter(property -> filters.getUniversity() == null || filters.getUniversity().equals("Any") ||
                        (property.getNearestCampus() != null && property.getNearestCampus().equals(filters.getUniversity())))

                // --- Filter by Listed For ---
                // .name() converts the enum (e.g., ListedFor.BOYS) to a string ("BOYS") for comparison.
                .filter(property -> filters.getListedFor() == null || filters.getListedFor().equals("ANYONE") ||
                        (property.getListedFor() != null && property.getListedFor().name().equals(filters.getListedFor())))

                // --- Filter by Property Type ---
                .filter(property -> filters.getPropertyType() == null || filters.getPropertyType().equals("any") ||
                        (property.getType() != null && property.getType().name().equals(filters.getPropertyType())))

                // --- Filter by Minimum Price ---
                // Uses BigDecimal's compareTo method for accurate price comparison.
                // compareTo returns >= 0 if property.getPrice() is greater than or equal to the filter price.
                .filter(property -> filters.getMinPrice() == null ||
                        property.getPrice().compareTo(BigDecimal.valueOf(filters.getMinPrice())) >= 0)

                // --- Filter by Maximum Price ---
                // compareTo returns <= 0 if property.getPrice() is less than or equal to the filter price.
                .filter(property -> filters.getMaxPrice() == null ||
                        property.getPrice().compareTo(BigDecimal.valueOf(filters.getMaxPrice())) <= 0)

                // --- Filter by Bedrooms ---
                // Matches your entity's 'noOfBeds' field.
                .filter(property -> {
                    if (filters.getBedrooms() == null || filters.getBedrooms().equals("any")) {
                        return true; // Keep if "any"
                    }
                    if ("4+".equals(filters.getBedrooms())) {
                        return property.getNoOfBeds() >= 4; // Special case for "4+"
                    }
                    // Compares the integer value.
                    return property.getNoOfBeds() == Integer.parseInt(filters.getBedrooms());
                })

                // --- Filter by Bathrooms ---
                // Matches your entity's 'noOfBaths' field.
                .filter(property -> {
                    if (filters.getBathrooms() == null || filters.getBathrooms().equals("any")) {
                        return true; // Keep if "any"
                    }
                    if ("3+".equals(filters.getBathrooms())) {
                        return property.getNoOfBaths() >= 3; // Special case for "3+"
                    }
                    return property.getNoOfBaths() == Integer.parseInt(filters.getBathrooms());
                })

                // --- Filter by Bills Included ---
                // This logic remains the same.
                // Assuming "Bills Included" amenity has ID 4.
                .filter(property -> {
                    if (filters.getBillsIncluded() == null) {
                        return true; // Keep if "any" or not specified
                    }
                    long billsIncludedAmenityId = 4L;
                    boolean hasAmenity = property.getAmenities().stream()
                            .anyMatch(amenity -> amenity.getId().equals(billsIncludedAmenityId));

                    // If filters.getBillsIncluded() is true, we need hasAmenity to be true.
                    // If filters.getBillsIncluded() is false, we need hasAmenity to be false.
                    return filters.getBillsIncluded() == hasAmenity;
                })

                // 3. Collect the results into a new list.
                .collect(Collectors.toList());


        // 4. Convert the final list of Property entities to DTOs and return.
        return filteredList.stream()
                .map(this::mapToPropertyDTO)
                .collect(Collectors.toList());
    }

    private PropertyDTO mapToPropertyDTO(Property property) {
        // 1. Create a new, empty DTO object.
        PropertyDTO dto = new PropertyDTO();

        // 2. Manually copy the data you want to expose from the entity to the DTO.
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

        // From the Set of Amenity entities, we only want their IDs.
        if (property.getAmenities() != null && !property.getAmenities().isEmpty()) {
            Set<Long> amenityIds = property.getAmenities().stream()
                    .map(Amenity::getId)
                    .collect(Collectors.toSet());
            dto.setAmenityIds(amenityIds);
        }

        // From the List of Photo entities, we only want the photo URLs.
        if (property.getPhotos() != null && !property.getPhotos().isEmpty()) {
            List<String> photoUrls = property.getPhotos().stream()
                    .map(Photo::getPhotoUrl)
                    .collect(Collectors.toList());
            dto.setPhotoUrls(photoUrls);
        }

        // From the User entity, we ONLY take the username and mobile number, NOT the password.
        if (property.getUser() != null) {
            dto.setOwnerName(property.getUser().getUsername());
            dto.setOwnerContact(property.getUser().getMobile());
        }

        // 4. Return the finished, safe-to-send DTO.
        return dto;
    }

    public List<PropertyDTO> getUnverifiedProperties() {
        List<Property> unverifiedProperties = propertyRepo.findAllByVerifiedFalse();

        return unverifiedProperties.stream()
                .map(this::mapToPropertyDTO)
                .collect(Collectors.toList());
    }

    public void approveProperty(Long id) {
        Property property = propertyRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Property not found with id : " + id));

        property.setVerified(true);

        propertyRepo.save(property);
    }

    public void rejectProperty(Long id) {
        boolean exist = propertyRepo.existsById(id);

        if (!exist) {
            throw new RuntimeException("Property not found with id : " + id);
        }

        propertyRepo.deleteById(id);
    }
}