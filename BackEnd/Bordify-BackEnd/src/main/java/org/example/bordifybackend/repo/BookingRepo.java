package org.example.bordifybackend.repo;

import org.example.bordifybackend.entity.BookingReq;
import org.example.bordifybackend.entity.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookingRepo extends JpaRepository<BookingReq, Long> {
    List<BookingReq> findByProperty_PropertyIdAndStatusAndIdNot(Long propertyId, BookingStatus status, Long idToExclude);

    long countByStatus(String booked);
}
