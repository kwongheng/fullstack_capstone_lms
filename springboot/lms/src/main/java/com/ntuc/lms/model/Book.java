package com.ntuc.lms.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

//model/Book.java
@Entity
@Table(name = "BOOK", uniqueConstraints = @UniqueConstraint(columnNames = "isbn"))
@Getter @Setter @NoArgsConstructor
public class Book {
 @Id
 @GeneratedValue(strategy = GenerationType.IDENTITY)
 private Long id;

 @NotBlank
 @Column(nullable = false, unique = true, length = 13)
 private String isbn;

 @NotBlank
 @Column(nullable = false, length = 500)
 private String title;

 @NotBlank
 @Column(nullable = false)
 private String author;

 private String category;

 @Column(name = "publication_year", nullable = false)
 private Short publicationYear;

 private String publisher;

 @Min(0)
 @Column(name = "total_copies", nullable = false)
 private Integer totalCopies;

 @Min(0)
 @Column(name = "available_copies", nullable = false)
 private Integer availableCopies;

 @PrePersist @PreUpdate
 private void validateCopies() {
     if (availableCopies > totalCopies) {
         throw new IllegalArgumentException("Available copies cannot exceed total copies");
     }
 }
}