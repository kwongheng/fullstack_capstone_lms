package com.ntuc.lms.services;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.ntuc.lms.model.Book;
import com.ntuc.lms.model.Borrow;
import com.ntuc.lms.model.Member;
import com.ntuc.lms.repository.BookRepository;
import com.ntuc.lms.repository.BorrowRepository;
import com.ntuc.lms.repository.MemberRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

//service/BorrowService.java
@Service
@RequiredArgsConstructor
@Transactional
public class BorrowService {
 private final BorrowRepository borrowRepository;
 private final BookRepository bookRepository;
 private final MemberRepository memberRepository;

 public List<Borrow> getAll() {
     return borrowRepository.findAll();
 }

 public List<Borrow> getActiveBorrows() {
     return borrowRepository.findByReturnedFalse();
 }

 public Borrow borrowBook(Integer memberId, Integer bookId) {
     Member member = memberRepository.findById(memberId)
             .orElseThrow(() -> new RuntimeException("Member not found"));
     Book book = bookRepository.findById(bookId)
             .orElseThrow(() -> new RuntimeException("Book not found"));

     if (book.getAvailableCopies() <= 0) {
         throw new RuntimeException("No copies available");
     }

     Borrow borrow = new Borrow();
     borrow.setMember(member);
     borrow.setBook(book);
     book.setAvailableCopies(book.getAvailableCopies() - 1);
     bookRepository.save(book);

     return borrowRepository.save(borrow);
 }

 public Borrow returnBook(Integer borrowId) {
     Borrow borrow = borrowRepository.findById(borrowId)
             .orElseThrow(() -> new RuntimeException("Borrow record not found"));
     if (borrow.isReturned()) {
         throw new RuntimeException("Book already returned");
     }
     borrow.setReturned(true);
     borrow.setReturnDate(LocalDateTime.now());
     Book book = borrow.getBook();
     book.setAvailableCopies(book.getAvailableCopies() + 1);
     bookRepository.save(book);
     return borrowRepository.save(borrow);
 }

 public Borrow renewBook(Integer borrowId) {
     Borrow borrow = borrowRepository.findById(borrowId)
             .orElseThrow(() -> new RuntimeException("Borrow record not found"));
     if (borrow.getTimesRenew() >= 2) {
         throw new RuntimeException("Maximum renewals reached");
     }
     borrow.renew();
     return borrowRepository.save(borrow);
 }

}