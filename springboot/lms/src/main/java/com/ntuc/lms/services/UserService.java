package com.ntuc.lms.services;

import java.util.List;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.ntuc.lms.model.User;
import com.ntuc.lms.repository.UserRepository;

import lombok.RequiredArgsConstructor;

//service/UserService.java
@Service
@RequiredArgsConstructor
public class UserService {
 private final UserRepository userRepository;
 private final PasswordEncoder passwordEncoder; // Add to SecurityConfig later

 public List<User> getAllUsers() {
     return userRepository.findAll();
 }

 public User getById(Integer id) {
     return userRepository.findById(id)
             .orElseThrow(() -> new RuntimeException("User not found"));
 }

 public User registerUser(User user) {
     user.setPasswordHash(passwordEncoder.encode(user.getPasswordHash()));
     return userRepository.save(user);
 }

 public User updateUser(Integer id, User userDetails) {
     User user = getById(id);
     user.setEmail(userDetails.getEmail());
     user.setFullName(userDetails.getFullName());
     user.setPhone(userDetails.getPhone());
     user.setAddress(userDetails.getAddress());
     user.setRole(userDetails.getRole());
     return userRepository.save(user);
 }

 public void deleteUser(Integer id) {
     userRepository.deleteById(id);
 }
}