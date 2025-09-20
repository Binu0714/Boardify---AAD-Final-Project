package org.example.bordifybackend.repo;

import org.example.bordifybackend.entity.Property;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PropertyRepo extends JpaRepository<Property, Long> {
    List<Property> findByUserUsername(String username);

    @Query("SELECT p FROM Property p " +
            "JOIN p.location l " +
            "WHERE LOWER(l.city) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "   OR LOWER(p.nearestCampus) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "   OR LOWER(CAST(p.type AS string)) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Property> searchProperties(@Param("keyword") String keyword);

    @Query("SELECT DISTINCT l.city FROM Property p JOIN p.location l ORDER BY l.city ASC")
    List<String> findDistinctCities();

    @Query("SELECT DISTINCT p.nearestCampus FROM Property p ORDER BY p.nearestCampus ASC")
    List<String> findDistinctUniversities();

    long countByAvailabilityTrue();
}

