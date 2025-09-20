package org.example.bordifybackend.Dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class StatsDTO {
    private long totalUsers;
    private long TotalListings;
    private long availableListings;
    private long bookedListings;
}
