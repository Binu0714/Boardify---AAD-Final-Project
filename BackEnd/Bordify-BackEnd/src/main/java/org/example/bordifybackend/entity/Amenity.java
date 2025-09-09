// Create this new file: Amenity.java
package org.example.bordifybackend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Set;
import java.util.HashSet;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "amenities")
public class Amenity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "amenity_id")
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    // This defines the "other side" of the many-to-many relationship.
    // It links back to all the properties that have this specific amenity.
    // 'mappedBy = "amenities"' tells JPA that the 'Property' entity manages the relationship table.
    @ManyToMany(mappedBy = "amenities")
    private Set<Property> properties = new HashSet<>();
}