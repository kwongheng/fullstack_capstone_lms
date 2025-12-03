package com.ntuc.lms.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ntuc.lms.model.Member;

public interface MemberRepository extends JpaRepository<Member, Integer> {}