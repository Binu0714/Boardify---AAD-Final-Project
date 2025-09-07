package org.example.bordifybackend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true)

// We use 'onlyExplicitlyIncluded = true' to prevent a StackOverflowError caused by the
// bidirectional @OneToOne relationship with the Property entity.
// By including ONLY the primary key (locationId) in the equals() and hashCode() methods,
// we break the infinite loop that would occur if Lombok tried to call property.hashCode().

@Table(name = "properties")
public class Property {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "property_id")
    @EqualsAndHashCode.Include
    private Long propertyId;

    @Column(nullable = false)
    private String title;

    @Lob
    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    private boolean availability;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PropertyType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ListedFor listedFor;

    @Column(name = "bedroom_count", nullable = false)
    private int noOfBeds;

    @Column(name = "bathroom_count", nullable = false)
    private int noOfBaths;

    @Column(name = "nearest_campus")
    private String nearestCampus;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "property_amenities", // This is the name of the new linking table that will be created
            joinColumns = @JoinColumn(name = "property_id"), // This column in the linking table points to a Property
            inverseJoinColumns = @JoinColumn(name = "amenity_id") // This column in the linking table points to an Amenity
    )
    private Set<Amenity> amenities = new HashSet<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "location_id", referencedColumnName = "location_id")
    private Location location;

    @OneToMany(mappedBy = "property", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Photo> photos = new ArrayList<>();

    @OneToMany(mappedBy = "property", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<BookingReq> bookingRequests = new ArrayList<>();

    @OneToMany(mappedBy = "property", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Review> reviews = new ArrayList<>();
}