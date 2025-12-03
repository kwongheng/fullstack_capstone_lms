package com.ntuc.lms.services;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.ntuc.lms.model.Borrow;
import com.ntuc.lms.model.Fine;
import com.ntuc.lms.repository.BorrowRepository;
import com.ntuc.lms.repository.FineRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

//service/FineService.java
@Service
@RequiredArgsConstructor
@Transactional
public class FineService {
 private final FineRepository fineRepository;
 private final BorrowRepository borrowRepository;

 public List<Fine> getAll() {
     return fineRepository.findAll();
 }

 public List<Fine> getUnpaidFines() {
     return fineRepository.findByPaidFalse();
 }

 public Fine createFine(Integer borrowId, BigDecimal amount) {
     Borrow borrow = borrowRepository.findById(borrowId)
             .orElseThrow(() -> new RuntimeException("Borrow not found"));
     Fine fine = new Fine();
     fine.setBorrow(borrow);
     fine.setAmount(amount);
     return fineRepository.save(fine);
 }

 public Fine payFine(Integer id) {
     Fine fine = fineRepository.findById(id)
             .orElseThrow(() -> new RuntimeException("Fine not found"));
     fine.setPaid(true);
     fine.setPaidAt(LocalDateTime.now());
     return fineRepository.save(fine);
 }
}