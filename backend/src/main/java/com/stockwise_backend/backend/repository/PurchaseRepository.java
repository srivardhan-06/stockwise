package com.stockwise_backend.backend.repository;

import com.stockwise_backend.backend.model.Purchase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PurchaseRepository extends JpaRepository<Purchase, String> {

    List<Purchase> findAllByOrderByDateDesc();

    @Query("SELECT COALESCE(SUM(p.total), 0) FROM Purchase p")
    Double getTotalRevenue();

    @Query("SELECT p FROM Purchase p ORDER BY p.date DESC")
    List<Purchase> findTop5ByOrderByDateDesc(org.springframework.data.domain.Pageable pageable);
}
