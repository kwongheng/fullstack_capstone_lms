package com.ntuc.lms.services;

import java.time.Year;
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
		return bookRepository.findById(id).orElseThrow(() -> new RuntimeException("Book not found"));
	}

	public Book getByIsbn(String isbn) {
		return bookRepository.findByIsbn(isbn)
				.orElseThrow(() -> new RuntimeException("Book not found with ISBN: " + isbn));
	}

	public List<Book> searchByTitle(String title) {
		if (title == null || title.trim().isEmpty()) {
			return getAll(); // or return empty list — your choice
		}
		return bookRepository.findByTitleContainingIgnoreCase(title.trim());
	}

	public List<Book> searchByAuthor(String author) {
		if (author == null || author.trim().isEmpty()) {
			return getAll();
		}
		return bookRepository.findByAuthorContainingIgnoreCase(author.trim());
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
	
    public List<Book> searchByCategory(String category) {
        if (category == null || category.trim().isEmpty()) {
            return getAll();
        }
        return bookRepository.findByCategoryContainingIgnoreCase(category.trim());
    }

    public List<Book> searchByPublisher(String publisher) {
        if (publisher == null || publisher.trim().isEmpty()) {
            return getAll();
        }
        return bookRepository.findByPublisherContainingIgnoreCase(publisher.trim());
    }

    public List<Book> searchByPublicationYear(Integer year) {
        if (year == null) {
            return getAll();
        }
        return bookRepository.findByPublicationYear(Year.of(year));
    }

    public List<Book> searchByPublicationYearRange(Integer startYear, Integer endYear) {
        if (startYear == null && endYear == null) {
            return getAll();
        }
        if (startYear == null || endYear == null || startYear > endYear) {
            return getAll(); // or throw validation exception if preferred
        }
        return bookRepository.findByPublicationYearBetween(Year.of(startYear), Year.of(endYear));
    }
}