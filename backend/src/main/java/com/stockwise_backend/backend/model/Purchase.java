package com.stockwise_backend.backend.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "purchases")
public class Purchase {

    @Id
    private String id;

    private String customer;
    private String email;
    private String product;

    @Column(name = "product_id")
    private Long productId;

    private String category;
    private Integer qty;
    private Double total;
    private String date;
    private String status;

    @Column(name = "payment_mode")
    private String paymentMode;

    private String note;
}
