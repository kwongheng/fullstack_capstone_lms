package com.ntuc.lms.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ntuc.lms.model.Borrow;
import com.ntuc.lms.services.BorrowService;

import lombok.RequiredArgsConstructor;

//controller/BorrowController.java
@RestController
@RequestMapping("/api/borrows")
@RequiredArgsConstructor
public class BorrowController {

 private final BorrowService borrowService;

 @GetMapping
 public ResponseEntity<List<Borrow>> getAllBorrows() {
     return ResponseEntity.ok(borrowService.getAll());
 }

 @GetMapping("/active")
 public ResponseEntity<List<Borrow>> getActiveBorrows() {
     return ResponseEntity.ok(borrowService.getActiveBorrows());
 }

 @PostMapping
 public ResponseEntity<Borrow> borrowBook(@RequestBody BorrowRequest request) {
     Borrow borrow = borrowService.borrowBook(
             request.memberUserId(),
             request.bookId()
     );
     return ResponseEntity.status(HttpStatus.CREATED).body(borrow);
 }

 @PatchMapping("/{id}/return")
 public ResponseEntity<Borrow> returnBook(@PathVariable Long id) {
     Borrow returned = borrowService.returnBook(id);
     return ResponseEntity.ok(returned);
 }

 @PatchMapping("/{id}/renew")
 public ResponseEntity<Borrow> renewBook(@PathVariable Long id) {
     Borrow renewed = borrowService.renewBook(id);
     return ResponseEntity.ok(renewed);
 }
}

record BorrowRequest(Long memberUserId, Long bookId) {}