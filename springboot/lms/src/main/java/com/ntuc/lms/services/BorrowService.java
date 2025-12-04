package com.ntuc.lms.services;

import java.math.BigDecimal;
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
		return borrowRepository.findByIsReturnedFalse();
	}

	public Borrow borrowBook(Integer memberId, Integer bookId) {
		Member member = memberRepository.findById(memberId).orElseThrow(() -> new RuntimeException("Member not found"));
		Book book = bookRepository.findById(bookId).orElseThrow(() -> new RuntimeException("Book not found"));

		if (book.getAvailableCopies() <= 0) {
			throw new RuntimeException("No copies available");
		}

		Borrow borrow = new Borrow();
		borrow.setMember(member);
		borrow.setBook(book);
		borrow.setDueDate(LocalDateTime.now().plusDays(14));
		book.setAvailableCopies(book.getAvailableCopies() - 1);
		bookRepository.save(book);

		return borrowRepository.save(borrow);
	}

	@Transactional
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

	@Transactional
	public Borrow renewBook(Integer borrowId) {
		Borrow borrow = borrowRepository.findById(borrowId)
				.orElseThrow(() -> new RuntimeException("Borrow record not found"));

		if (borrow.isReturned()) {
			throw new RuntimeException("Cannot renew a returned book");
		}
		if (borrow.getTimesRenew() >= 2) {
			throw new RuntimeException("Maximum 2 renewals allowed");
		}

		LocalDateTime now = LocalDateTime.now();
		borrow.setBorrowDate(now);
		borrow.setDueDate(now.plusDays(14));
		borrow.setTimesRenew((byte) (borrow.getTimesRenew() + 1));

		return borrowRepository.save(borrow);
	}

	@Transactional
	public Borrow calculateFine(Integer borrowId) {
		Borrow borrow = borrowRepository.findById(borrowId).orElseThrow(() -> new RuntimeException("Borrow not found"));

		if (borrow.isReturned()) {
			// Fine is frozen at return time — do nothing
			return borrow;
		}

		LocalDateTime now = LocalDateTime.now();
		LocalDateTime dueDate = borrow.getDueDate();

		if (dueDate == null || now.isBefore(dueDate)) {
			borrow.setFineAmount(BigDecimal.ZERO);
		} else {
			long overdueDays = java.time.Duration.between(dueDate, now).toDays();
			BigDecimal calculated = BigDecimal.valueOf(overdueDays).multiply(BigDecimal.valueOf(0.5))
					.min(BigDecimal.valueOf(20.00)).setScale(2, java.math.RoundingMode.HALF_UP);
			borrow.setFineAmount(calculated);
		}

		return borrowRepository.save(borrow);
	}

	@Transactional
	public Borrow payFine(Integer borrowId) {
		Borrow borrow = borrowRepository.findById(borrowId).orElseThrow(() -> new RuntimeException("Borrow not found"));

		// Return the book (if not already returned)
		if (!borrow.isReturned()) {
			returnBook(borrowId); 
		}

		// Clear fine and record payment time
		borrow.setFineAmount(BigDecimal.ZERO);
		borrow.setFinePaidAt(LocalDateTime.now());

		return borrowRepository.save(borrow);
	}
}