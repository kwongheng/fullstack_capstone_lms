package com.ntuc.lms.repository;

import java.time.Year;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ntuc.lms.model.Book;

public interface BookRepository extends JpaRepository<Book, Integer> {
    Optional<Book> findByIsbn(String isbn);
    List<Book> findByTitleContainingIgnoreCase(String title);
    List<Book> findByAuthorContainingIgnoreCase(String author);
    List<Book> findByCategoryContainingIgnoreCase(String category);
    List<Book> findByPublisherContainingIgnoreCase(String publisher);
    List<Book> findByPublicationYear(Year publicationYear);
    List<Book> findByPublicationYearBetween(Year startYear, Year endYear);
}