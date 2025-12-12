package com.ntuc.lms.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import java.time.Year;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

//model/Book.java
@Entity
@Table(name = "BOOK", indexes = {
    @Index(name = "IDX_BOOK_TITLE", columnList = "title"),
    @Index(name = "IDX_BOOK_ISBN", columnList = "isbn")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder(toBuilder = true)
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Book {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @NotBlank
    @Column(nullable = false, unique = true, length = 13)
    private String isbn;

    @NotBlank
    @Column(nullable = false, length = 500)
    private String title;

    @NotBlank
    @Column(nullable = false, length = 255)
    private String author;

    @Column(length = 100)
    private String category;

    @Column(name = "publication_year", nullable = false, columnDefinition = "YEAR")
    private Year publicationYear;

    @Column(length = 255)
    private String publisher;

    @Min(0)
    @Column(name = "total_copies", nullable = false)
    @Builder.Default
    private int totalCopies = 1;                    // sensible default

    @Min(0)
    @Column(name = "available_copies", nullable = false)
    @Builder.Default
    private int availableCopies = 1;                // starts fully available
}