package com.stockwise_backend.backend.controller;

import com.stockwise_backend.backend.model.Product;
import com.stockwise_backend.backend.model.Purchase;
import com.stockwise_backend.backend.repository.ProductRepository;
import com.stockwise_backend.backend.repository.PurchaseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "http://localhost:3000")
public class DashboardController {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private PurchaseRepository purchaseRepository;

    @GetMapping
    public Map<String, Object> getDashboard() {
        List<Product>  products  = productRepository.findAll();
        List<Purchase> purchases = purchaseRepository.findAllByOrderByDateDesc();

        double totalRevenue  = purchases.stream().mapToDouble(p -> p.getTotal() != null ? p.getTotal() : 0).sum();
        long   totalOrders   = purchases.size();
        long   totalProducts = products.size();
        long   lowStock      = products.stream().filter(p -> p.getQuantity() != null && p.getQuantity() > 0 && p.getQuantity() <= 10).count();
        long   outOfStock    = products.stream().filter(p -> p.getQuantity() != null && p.getQuantity() == 0).count();

        List<Purchase> recentOrders = purchases.stream().limit(5).toList();

        Map<String, Object> result = new HashMap<>();
        result.put("totalRevenue",  Math.round(totalRevenue * 100.0) / 100.0);
        result.put("totalOrders",   totalOrders);
        result.put("totalProducts", totalProducts);
        result.put("lowStock",      lowStock);
        result.put("outOfStock",    outOfStock);
        result.put("recentOrders",  recentOrders);
        return result;
    }
}
