package com.example.demo.service;

import com.example.demo.model.Favorite;
import com.example.demo.repository.FavoriteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FavoriteService {

    @Autowired
    private FavoriteRepository favoriteRepository;

    public List<Favorite> getFavorites(String email) {
        if (email == null) return List.of();
        return favoriteRepository.findByUserEmail(email.toLowerCase());
    }

    public boolean toggleFavorite(String email, String carId, String carType) {
        if (email == null || carId == null) return false;
        String lowEmail = email.toLowerCase();

        return favoriteRepository
                .findByUserEmailAndCarId(lowEmail, carId)
                .map(existing -> {
                    favoriteRepository.delete(existing);
                    return false;
                })
                .orElseGet(() -> {
                    favoriteRepository.save(
                            new Favorite(lowEmail, carId, carType)
                    );
                    return true;
                });
    }

    public void remove(String email, String carId) {
        if (email == null || carId == null) return;
        favoriteRepository
                .findByUserEmailAndCarId(email.toLowerCase(), carId)
                .ifPresent(favoriteRepository::delete);
    }
}
