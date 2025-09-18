package org.example.bordifybackend.Dto;

import lombok.Data;

@Data
public class FilterDTO {
    private String location;
    private String university;
    private String listedFor;
    private String propertyType;
    private Integer minPrice;
    private Integer maxPrice;
    private String bedrooms;
    private String bathrooms;
    private Boolean billsIncluded;
}
