package com.example.demo.controller;

import com.example.demo.dto.ShowroomDTO;
import com.example.demo.model.Showroom;
import com.example.demo.repository.ShowroomRepository;
import com.example.demo.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/showroom")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"}, allowCredentials = "true")
public class ShowroomController {

    @Autowired
    private ShowroomRepository showroomRepository;

    @Autowired
    private JwtUtil jwtUtil;

    private BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    // =========================
    // SIGNUP
    // =========================
    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody ShowroomDTO dto) {
        if (dto.getEmail() == null || dto.getPassword() == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "All fields required"));
        }

        if (showroomRepository.findByEmail(dto.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email already exists"));
        }

        Showroom showroom = new Showroom();
        showroom.setName(dto.getName());
        showroom.setEmail(dto.getEmail().trim().toLowerCase());
        showroom.setPhone(dto.getPhone());
        showroom.setAddress(dto.getAddress());
        showroom.setPassword(passwordEncoder.encode(dto.getPassword()));

        showroomRepository.save(showroom);
        return ResponseEntity.ok(Map.of("message", "Signup successful"));
    }

    // =========================
    // LOGIN
    // =========================
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody ShowroomDTO dto) {
        if (dto.getEmail() == null || dto.getPassword() == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "All fields required"));
        }

        Optional<Showroom> opt = showroomRepository.findByEmail(dto.getEmail().trim().toLowerCase());
        if (opt.isEmpty()) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid email or password"));
        }

        Showroom showroom = opt.get();
        if (!passwordEncoder.matches(dto.getPassword(), showroom.getPassword())) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid email or password"));
        }

        String token = jwtUtil.generateToken(showroom.getEmail(), "SHOWROOM");
        return ResponseEntity.ok(Map.of("token", token, "name", showroom.getName(), "email", showroom.getEmail(), "role", "SHOWROOM"));
    }

    // =========================
    // GOOGLE LOGIN
    // =========================
    @PostMapping("/google-login")
    public ResponseEntity<?> googleLogin(@RequestBody ShowroomDTO dto) {
        Optional<Showroom> opt = showroomRepository.findByEmail(dto.getEmail().trim().toLowerCase());
        Showroom showroom;

        if (opt.isEmpty()) {
            showroom = new Showroom();
            showroom.setName(dto.getName());
            showroom.setEmail(dto.getEmail().trim().toLowerCase());
            showroom.setPassword(passwordEncoder.encode("GOOGLE_USER"));
            showroomRepository.save(showroom);
        } else {
            showroom = opt.get();
        }

        String token = jwtUtil.generateToken(showroom.getEmail(), "SHOWROOM");
        return ResponseEntity.ok(Map.of("token", token, "name", showroom.getName(), "email", showroom.getEmail(), "role", "SHOWROOM"));
    }
}
