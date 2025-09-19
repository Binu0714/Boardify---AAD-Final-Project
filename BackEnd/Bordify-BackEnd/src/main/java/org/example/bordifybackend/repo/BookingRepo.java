package org.example.bordifybackend.repo;

import org.example.bordifybackend.entity.BookingReq;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BookingRepo extends JpaRepository<BookingReq, Long> {
}
