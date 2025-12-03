package com.ntuc.lms.services;

import java.util.List;

import org.springframework.stereotype.Service;

import com.ntuc.lms.model.Book;
import com.ntuc.lms.repository.BookRepository;

import lombok.RequiredArgsConstructor;

//service/BookService.java
@Service
@RequiredArgsConstructor
public class BookService {
 private final BookRepository bookRepository;

 public List<Book> getAll() {
     return bookRepository.findAll();
 }

 public Book getById(Integer id) {
     return bookRepository.findById(id)
             .orElseThrow(() -> new RuntimeException("Book not found"));
 }

 public Book getByIsbn(String isbn) {
     return bookRepository.findByIsbn(isbn)
             .orElseThrow(() -> new RuntimeException("Book not found with ISBN: " + isbn));
 }

 public Book save(Book book) {
     return bookRepository.save(book);
 }

 public Book updateBook(Integer id, Book bookDetails) {
     Book book = getById(id);
     book.setIsbn(bookDetails.getIsbn());
     book.setTitle(bookDetails.getTitle());
     book.setAuthor(bookDetails.getAuthor());
     book.setCategory(bookDetails.getCategory());
     book.setPublicationYear(bookDetails.getPublicationYear());
     book.setPublisher(bookDetails.getPublisher());
     book.setTotalCopies(bookDetails.getTotalCopies());
     book.setAvailableCopies(bookDetails.getAvailableCopies());
     return bookRepository.save(book);
 }

 public Book updateCopies(Integer id, int total, int available) {
     Book book = getById(id);
     book.setTotalCopies(total);
     book.setAvailableCopies(available);
     return bookRepository.save(book);
 }

 public void delete(Integer id) {
     bookRepository.deleteById(id);
 }
}