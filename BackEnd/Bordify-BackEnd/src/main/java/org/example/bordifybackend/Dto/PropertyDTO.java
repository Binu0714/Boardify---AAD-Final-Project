package org.example.bordifybackend.Dto;

import lombok.Data;
import org.example.bordifybackend.entity.ListedFor;
import org.example.bordifybackend.entity.PropertyType;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Data
public class PropertyDTO {
    private long id;

    private String title;
    private String description;
    private PropertyType propertyType;
    private ListedFor listedFor;
    private int noOfBeds;
    private int noOfBaths;
    private String nearestCampus;
    private BigDecimal price;
    private boolean availability;

    private String city;
    private String district;
    private String address;
    private BigDecimal latitude;
    private BigDecimal longitude;

    //front end eken ewanne amenities set ekk.......
    private Set<Long> amenityIds = new HashSet<>();
    private List<String> photoUrls = new ArrayList<>();

    private String ownerName;
    private String ownerContact;
    private String ownerAvatarUrl;

}
