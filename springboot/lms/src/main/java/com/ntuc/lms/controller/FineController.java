package com.ntuc.lms.controller;

import java.math.BigDecimal;
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

import com.ntuc.lms.model.Fine;
import com.ntuc.lms.services.FineService;

import lombok.RequiredArgsConstructor;

//controller/FineController.java
@RestController
@RequestMapping("/api/fines")
@RequiredArgsConstructor
public class FineController {

 private final FineService fineService;

 @GetMapping
 public ResponseEntity<List<Fine>> getAllFines() {
     return ResponseEntity.ok(fineService.getAll());
 }

 @GetMapping("/unpaid")
 public ResponseEntity<List<Fine>> getUnpaidFines() {
     return ResponseEntity.ok(fineService.getUnpaidFines());
 }

 @PostMapping
 public ResponseEntity<Fine> createFine(@RequestBody FineRequest request) {
     Fine fine = fineService.createFine(request.borrowId(), request.amount());
     return ResponseEntity.status(HttpStatus.CREATED).body(fine);
 }

 @PatchMapping("/{id}/pay")
 public ResponseEntity<Fine> payFine(@PathVariable Integer id) {
     Fine paid = fineService.payFine(id);
     return ResponseEntity.ok(paid);
 }
}

record FineRequest(Integer borrowId, BigDecimal amount) {}