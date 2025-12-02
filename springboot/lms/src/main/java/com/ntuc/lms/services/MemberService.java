package com.ntuc.lms.services;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;

import com.ntuc.lms.model.Member;
import com.ntuc.lms.model.User;
import com.ntuc.lms.repository.MemberRepository;
import com.ntuc.lms.repository.UserRepository;

import lombok.RequiredArgsConstructor;

//service/MemberService.java
@Service
@RequiredArgsConstructor
public class MemberService {
 private final MemberRepository memberRepository;
 private final UserRepository userRepository;

 public List<Member> getAllMembers() {
     return memberRepository.findAll();
 }

 public Member getByUserId(Long userId) {
     return memberRepository.findById(userId)
             .orElseThrow(() -> new RuntimeException("Member not found"));
 }

 public Member createMember(Long userId, String memberId) {
     User user = userRepository.findById(userId)
             .orElseThrow(() -> new RuntimeException("User not found"));
     Member member = new Member();
     member.setUser(user);
     member.setMemberId(memberId);
     member.setJoinDate(LocalDate.now());
     member.setStatus(Member.Status.Active);
     return memberRepository.save(member);
 }
}