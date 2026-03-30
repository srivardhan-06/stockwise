package com.stockwise_backend.backend.controller;

import com.stockwise_backend.backend.model.Purchase;
import com.stockwise_backend.backend.repository.PurchaseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/purchases")
@CrossOrigin(origins = "http://localhost:3000")
public class PurchaseController {

    @Autowired
    private PurchaseRepository purchaseRepository;

    // GET all purchases ordered by date
    @GetMapping
    public List<Purchase> getAllPurchases() {
        return purchaseRepository.findAllByOrderByDateDesc();
    }
}
