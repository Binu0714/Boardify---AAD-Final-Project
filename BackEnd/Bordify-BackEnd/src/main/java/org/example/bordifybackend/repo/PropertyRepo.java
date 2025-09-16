package org.example.bordifybackend.repo;

import org.example.bordifybackend.entity.Property;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PropertyRepo extends JpaRepository<Property, Long> {
    List<Property> findByUserUsername(String username);
}

