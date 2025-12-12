package com.ntuc.lms.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ntuc.lms.model.Book;
import com.ntuc.lms.services.BookService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

//controller/BookController.java
@RestController
@RequestMapping("/api/books")
@RequiredArgsConstructor
public class BookController {

 private final BookService bookService;

 @GetMapping
 public ResponseEntity<List<Book>> getAllBooks() {
     return ResponseEntity.ok(bookService.getAll());
 }

 @GetMapping("/{id}")
 public ResponseEntity<Book> getBookById(@PathVariable Integer id) {
     return ResponseEntity.ok(bookService.getById(id));
 }

 @GetMapping("/isbn/{isbn}")
 public ResponseEntity<Book> getByIsbn(@PathVariable String isbn) {
     return ResponseEntity.ok(bookService.getByIsbn(isbn));
 }

 @GetMapping("/search/title")
 public ResponseEntity<List<Book>> searchByTitle(
         @RequestParam(required = false) String title) {
     return ResponseEntity.ok(bookService.searchByTitle(title));
 }

 @GetMapping("/search/author")
 public ResponseEntity<List<Book>> searchByAuthor(
         @RequestParam(required = false) String author) {
     return ResponseEntity.ok(bookService.searchByAuthor(author));
 }
 
 @GetMapping("/search/category")
 public ResponseEntity<List<Book>> searchByCategory(
         @RequestParam(required = false) String category) {
     return ResponseEntity.ok(bookService.searchByCategory(category));
 }

 @GetMapping("/search/publisher")
 public ResponseEntity<List<Book>> searchByPublisher(
         @RequestParam(required = false) String publisher) {
     return ResponseEntity.ok(bookService.searchByPublisher(publisher));
 }

 @GetMapping("/search/year")
 public ResponseEntity<List<Book>> searchByYear(
         @RequestParam(required = false) Integer year) {
     return ResponseEntity.ok(bookService.searchByPublicationYear(year));
 }

 @GetMapping("/search/year-range")
 public ResponseEntity<List<Book>> searchByYearRange(
         @RequestParam(required = false) Integer startYear,
         @RequestParam(required = false) Integer endYear) {
     return ResponseEntity.ok(bookService.searchByPublicationYearRange(startYear, endYear));
 }
 
 @PostMapping
 public ResponseEntity<Book> addBook(@Valid @RequestBody Book book) {
     Book saved = bookService.save(book);
     return ResponseEntity.status(HttpStatus.CREATED).body(saved);
 }

 @PutMapping("/{id}")
 public ResponseEntity<Book> updateBook(@PathVariable Integer id, @Valid @RequestBody Book book) {
     Book updated = bookService.updateBook(id, book);
     return ResponseEntity.ok(updated);
 }

 @PatchMapping("/{id}/copies")
 public ResponseEntity<Book> updateCopies(@PathVariable Integer id,
                                          @RequestBody CopiesUpdateRequest request) {
     Book updated = bookService.updateCopies(id, request.total(), request.available());
     return ResponseEntity.ok(updated);
 }

 @DeleteMapping("/{id}")
 public ResponseEntity<Void> deleteBook(@PathVariable Integer id) {
     bookService.delete(id);
     return ResponseEntity.noContent().build();
 }
}

record CopiesUpdateRequest(int total, int available) {}