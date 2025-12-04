package com.ntuc.lms.controller;

import java.util.List;

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

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

//controller/UserController.java
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Validated
public class UserController {

	private final UserService userService;

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
}