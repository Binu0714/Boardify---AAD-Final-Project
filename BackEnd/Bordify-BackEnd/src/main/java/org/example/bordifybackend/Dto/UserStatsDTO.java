package org.example.bordifybackend.Dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@AllArgsConstructor
public class UserStatsDTO {
    private long totalAds;
    private long myTotalAds;
    private long myApprovedAds;
}
