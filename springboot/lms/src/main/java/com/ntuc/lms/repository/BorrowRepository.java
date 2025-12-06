package com.ntuc.lms.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ntuc.lms.model.Borrow;

public interface BorrowRepository extends JpaRepository<Borrow, Integer> {
	
	List<Borrow> findByIsReturnedFalse(); 
	Optional<Borrow> findByIsReturnedFalseAndMember_User_IdAndBook_Id(Integer memberId, Integer bookId);
	List<Borrow> findByMemberUserIdAndIsReturnedFalse(Integer userId);
	boolean existsByMemberUserIdAndBookIdAndIsReturnedFalse(Integer userId, Integer bookId);
	List<Borrow> findByMemberUserId(Integer userId);
}
