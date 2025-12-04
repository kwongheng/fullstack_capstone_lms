package com.ntuc.lms.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ntuc.lms.model.Borrow;

public interface BorrowRepository extends JpaRepository<Borrow, Integer> {
    List<Borrow> findByIsReturnedFalse();  
}