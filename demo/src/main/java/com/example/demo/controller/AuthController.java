package com.example.demo.controller;

import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;
import com.example.demo.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(
        origins = {"http://localhost:5173", "http://localhost:3000"},
        allowCredentials = "true"
)
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    // =========================
    // NORMAL SIGNUP
    // =========================
    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody User user) {
        if (user.getEmail() == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email is required"));
        }
        
        String lowEmail = user.getEmail().trim().toLowerCase();
        user.setEmail(lowEmail);

        if (userRepository.findByEmail(lowEmail).isPresent()) {
            return ResponseEntity
                    .badRequest()
                    .body(Map.of("message", "Email already exists"));
        }
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "Signup successful"));
    }

    // =========================
    // NORMAL LOGIN
    // =========================
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User user) {
        if (user.getEmail() == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email is required"));
        }

        String lowEmail = user.getEmail().trim().toLowerCase();
        Optional<User> existingUser = userRepository.findByEmail(lowEmail);

        if (existingUser.isPresent()) {
            User dbUser = existingUser.get();
            if (dbUser.getPassword() != null && dbUser.getPassword().equals(user.getPassword())) {
                String token = jwtUtil.generateToken(dbUser.getEmail(), dbUser.getRole() != null ? dbUser.getRole() : "USER");
                
                Map<String, Object> response = new HashMap<>();
                response.put("message", "Login successful");
                response.put("token", token);
                response.put("name", dbUser.getName());
                response.put("email", dbUser.getEmail());
                response.put("role", dbUser.getRole() != null ? dbUser.getRole() : "USER");
                
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.status(401).body(Map.of("message", "Incorrect password"));
            }
        }
        return ResponseEntity.status(404).body(Map.of("message", "User not found"));
    }

    // =========================
    // GOOGLE LOGIN / SIGNUP
    // =========================
    @PostMapping("/google-login")
    public ResponseEntity<?> googleLogin(@RequestBody User user) {
        if (user.getEmail() == null) {
             return ResponseEntity.badRequest().body(Map.of("message", "Email is required"));
        }
        
        String lowEmail = user.getEmail().trim().toLowerCase();
        user.setEmail(lowEmail);

        Optional<User> existingUser = userRepository.findByEmail(lowEmail);
        User sessionUser;

        if (existingUser.isEmpty()) {
            user.setPassword("");
            user.setRole("USER");
            sessionUser = userRepository.save(user);
        } else {
            sessionUser = existingUser.get();
        }

        String token = jwtUtil.generateToken(sessionUser.getEmail(), sessionUser.getRole());

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Google login successful");
        response.put("token", token);
        response.put("name", sessionUser.getName());
        response.put("email", sessionUser.getEmail());
        response.put("role", sessionUser.getRole());

        return ResponseEntity.ok(response);
    }

    // =========================
    // CHECK CURRENT USER
    // =========================
    @GetMapping("/me")
    public ResponseEntity<?> currentUser(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            try {
                String email = jwtUtil.extractUsername(token);
                if (email != null) {
                    Optional<User> user = userRepository.findByEmail(email.toLowerCase());
                    if (user.isPresent()) {
                        return ResponseEntity.ok(user.get());
                    }
                }
            } catch (Exception e) {
                return ResponseEntity.status(401).body(Map.of("message", "Invalid token"));
            }
        }
        return ResponseEntity.status(401).body(Map.of("message", "Not logged in"));
    }
}