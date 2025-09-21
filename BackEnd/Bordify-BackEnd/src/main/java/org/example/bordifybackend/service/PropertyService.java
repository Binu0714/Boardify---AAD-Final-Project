package org.example.bordifybackend.service;

import org.example.bordifybackend.Dto.FilterDTO;
import org.example.bordifybackend.Dto.PropertyDTO;
import org.example.bordifybackend.entity.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;


public interface PropertyService {
     Property createProperty(PropertyDTO propertyDTO, List<MultipartFile> images);
     List<PropertyDTO> getAllProperties();
     PropertyDTO getPropertyById(Long id);
     List<PropertyDTO> getMyAds();
     void deleteProperty(Long id);
     void updateProperty(Long id, PropertyDTO propertyDTO, List<MultipartFile> images);
     List<PropertyDTO> searchProperties(String keyword);
     List<String> getAllCities();
     List<String> getAllUniversities();
     List<PropertyDTO> filterProperties(FilterDTO filters);
     List<PropertyDTO> getUnverifiedProperties();
     void approveProperty(Long id);
     void rejectProperty(Long id);
     List<PropertyDTO> getAllAds();
}
