package com.stockwise_backend.backend.controller;

import com.stockwise_backend.backend.model.User;
import com.stockwise_backend.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    // POST signup
    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody User user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", "An account with this email already exists."));
        }
        User saved = userRepository.save(user);
        saved.setPassword(null); // never return password
        return ResponseEntity.ok(saved);
    }

    // POST login
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String email    = body.get("email");
        String password = body.get("password");

        Optional<User> user = userRepository.findByEmailAndPassword(email, password);
        if (user.isEmpty()) {
            return ResponseEntity.status(401)
                .body(Map.of("error", "Incorrect email or password. Please try again."));
        }
        User u = user.get();
        u.setPassword(null); // never return password
        return ResponseEntity.ok(u);
    }
}
