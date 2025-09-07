package org.example.bordifybackend.repo;

import org.example.bordifybackend.entity.Amenity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AmenityRepo extends JpaRepository<Amenity, Long> {
}
