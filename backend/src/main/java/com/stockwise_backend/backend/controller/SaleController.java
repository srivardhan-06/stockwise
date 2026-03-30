package com.stockwise_backend.backend.controller;

import com.stockwise_backend.backend.model.Product;
import com.stockwise_backend.backend.model.Purchase;
import com.stockwise_backend.backend.repository.ProductRepository;
import com.stockwise_backend.backend.repository.PurchaseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/sales")
@CrossOrigin(origins = "http://localhost:3000")
public class SaleController {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private PurchaseRepository purchaseRepository;

    @PostMapping
    public ResponseEntity<?> recordSale(@RequestBody Map<String, Object> body) {
        try {
            Long   productId     = Long.valueOf(body.get("productId").toString());
            String customerName  = body.get("customerName").toString();
            String customerPhone = body.getOrDefault("customerPhone", "").toString();
            int    qty           = Integer.parseInt(body.get("qty").toString());
            String paymentMode   = body.getOrDefault("paymentMode", "Cash").toString();
            String note          = body.getOrDefault("note", "").toString();

            // Find product
            Optional<Product> optProduct = productRepository.findById(productId);
            if (optProduct.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Product not found"));
            }

            Product product = optProduct.get();

            // Check stock
            if (qty > product.getQuantity()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "Only " + product.getQuantity() + " unit(s) in stock"));
            }

            // Deduct stock
            int newQty = product.getQuantity() - qty;
            String newStatus = newQty == 0 ? "Out of Stock" : newQty <= 10 ? "Low Stock" : "In Stock";
            product.setQuantity(newQty);
            product.setStatus(newStatus);
            productRepository.save(product);

            // Create purchase record
            String orderId = "ORD-" + LocalDate.now().getYear() + "-" + System.currentTimeMillis();
            double total   = Math.round(product.getPrice() * qty * 100.0) / 100.0;
            String today   = LocalDate.now().toString();
            String email   = customerPhone.isEmpty() ? "Walk-in customer" : "Ph: " + customerPhone;

            Purchase purchase = new Purchase();
            purchase.setId(orderId);
            purchase.setCustomer(customerName);
            purchase.setEmail(email);
            purchase.setProduct(product.getName());
            purchase.setProductId(product.getId());
            purchase.setCategory(product.getCategory());
            purchase.setQty(qty);
            purchase.setTotal(total);
            purchase.setDate(today);
            purchase.setStatus("Delivered");
            purchase.setPaymentMode(paymentMode);
            purchase.setNote(note);
            purchaseRepository.save(purchase);

            return ResponseEntity.ok(Map.of(
                "success", true,
                "sale", Map.of(
                    "id", orderId,
                    "customer", customerName,
                    "product", product.getName(),
                    "qty", qty,
                    "total", total,
                    "paymentMode", paymentMode
                ),
                "updatedProduct", product
            ));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
