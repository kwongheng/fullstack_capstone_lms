package com.ntuc.lms.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ntuc.lms.model.Fine;

public interface FineRepository extends JpaRepository<Fine, Long> {
    List<Fine> findByPaidFalse();
}