package com.ntuc.lms.controller;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ntuc.lms.model.User;
import com.ntuc.lms.services.UserService;
import com.ntuc.lms.services.JwtService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

//controller/UserController.java
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Validated
public class UserController {

	private final UserService userService;
	private final JwtService jwtService;

	@GetMapping
	public ResponseEntity<List<User>> getAllUsers() {
		return ResponseEntity.ok(userService.getAllUsers());
	}

	@GetMapping("/{id}")
	public ResponseEntity<User> getUserById(@PathVariable Integer id) {
		User user = userService.getById(id);
		return ResponseEntity.ok(user);
	}

	@GetMapping("/search")
	public ResponseEntity<List<User>> searchUsersByName(@RequestParam(required = false) String name) {
		return ResponseEntity.ok(userService.searchByName(name));
	}

	@GetMapping("/check-email")
	public ResponseEntity<Map<String, Boolean>> checkEmailAvailability(
	        @RequestParam String email,
	        @RequestParam(required = false) Integer excludeId) {

	    Optional<User> user = userService.findByEmail(email);

	    boolean available = user.isEmpty() ||
	            (excludeId != null && user.isPresent() && user.get().getId().equals(excludeId));

	    return ResponseEntity.ok(Map.of("available", available));
	}
	
	@PostMapping("/login")
	public ResponseEntity<?> login(@RequestBody LoginRequest request) {
	    Optional<User> userOpt = userService.findByEmail(request.email());

	    if (userOpt.isPresent()) {
	        User user = userOpt.get();
	        String token = jwtService.generateToken(user);
	        AuthResponse authResponse = new AuthResponse(
	                token,
	                user.getId(),
	                user.getEmail(),
	                user.getFullName(),
	                user.getRole().name()
	        );
	        return ResponseEntity.ok(authResponse);
	    } else {
	        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
	                .body(Map.of("error", "Invalid email or password"));
	    }
	}
	
//	@PostMapping("/login")
//	public ResponseEntity<?> login(@RequestBody LoginRequest request) {
//	    Optional<User> userOpt = userService.findByEmail(request.email());
//
//	    if (userOpt.isPresent()) {
//	        User user = userOpt.get();
//	        LoginResponse response = new LoginResponse(
//	            user.getId(),
//	            user.getEmail(),
//	            user.getFullName(),
//	            user.getRole().name()  // returns "Admin" or "Member" as String
//	        );
//	        return ResponseEntity.ok(response);
//	    } else {
//	        return ResponseEntity
//	            .status(HttpStatus.UNAUTHORIZED)
//	            .body("Invalid email or password");
//	    }
//	}

	// Simple DTOs – add as inner records or separate files
	record LoginRequest(String email, String password) {}
	record LoginResponse(Integer id, String email, String fullName, String role) {}
	
	@PostMapping
	public ResponseEntity<User> createUser(@Valid @RequestBody User user) {
		User saved = userService.registerUser(user);
		return ResponseEntity.status(HttpStatus.CREATED).body(saved);
	}

	@PutMapping("/{id}")
	public ResponseEntity<User> updateUser(@PathVariable Integer id, @Valid @RequestBody User user) {
		User updated = userService.updateUser(id, user);
		return ResponseEntity.ok(updated);
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> deleteUser(@PathVariable Integer id) {
		userService.deleteUser(id);
		return ResponseEntity.noContent().build();
	}
	
	record AuthResponse(String token, Integer id, String email, String fullName, String role) {}
}
