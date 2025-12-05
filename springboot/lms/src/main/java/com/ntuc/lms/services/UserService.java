// UserService.java
package com.ntuc.lms.services;

import java.util.List;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.ntuc.lms.model.User;
import com.ntuc.lms.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User getById(Integer id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }

    public List<User> searchByName(String name) {
        if (name == null || name.trim().isEmpty()) {
            return getAllUsers();
        }
        return userRepository.findByFullNameContainingIgnoreCase(name.trim());
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    // CREATE USER
    public User registerUser(User user) {
        if (user.getEmail() == null || user.getEmail().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email is required");
        }
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email is already registered");
        }

        user.setPasswordHash(passwordEncoder.encode(user.getPasswordHash()));
        return userRepository.save(user);
    }

    public User updateUser(Integer id, User userDetails) {
        User existing = getById(id);

        if (userDetails.getEmail() != null && !userDetails.getEmail().equals(existing.getEmail())) {
            if (userRepository.findByEmail(userDetails.getEmail()).isPresent()) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already in use by another account");
            }
            existing.setEmail(userDetails.getEmail());
        }

        // Update other fields only if provided
        if (userDetails.getFullName() != null) {
            existing.setFullName(userDetails.getFullName());
        }
        if (userDetails.getPhone() != null) {
            existing.setPhone(userDetails.getPhone());
        }
        if (userDetails.getAddress() != null) {
            existing.setAddress(userDetails.getAddress());
        }
        if (userDetails.getRole() != null) {
            existing.setRole(userDetails.getRole());
        }

        return userRepository.save(existing);   // ← ONLY ONE RETURN
    }

    // DELETE USER
    public void deleteUser(Integer id) {
        if (!userRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
        }
        userRepository.deleteById(id);
    }
}