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

	public Member getByUserId(Integer userId) {
		return memberRepository.findById(userId).orElseThrow(() -> new RuntimeException("Member not found"));
	}

	public Member createMember(Integer userId, String memberId) {
		User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
		Member member = new Member();
		member.setUser(user);
		member.setMemberId(memberId);
		member.setJoinDate(LocalDate.now());
		member.setStatus(Member.Status.Active);
		return memberRepository.save(member);
	}

	public Member updateMemberStatus(Member member) {
		return memberRepository.save(member);
	}
	
	public Member renewMembership(Integer userId) {
	    Member member = getByUserId(userId);

	    // BLOCK renewal only if SUSPENDED
	    if (member.getStatus() == Member.Status.Suspended) {
	        throw new IllegalStateException("Cannot renew suspended membership. Contact administrator.");
	    }

	    // Allow renewal even if expired — this is intentional
	    member.setJoinDate(LocalDate.now()); // resets expiry to +1 year from today
	    member.setStatus(Member.Status.Active); // optional: force Active on renewal

	    return memberRepository.save(member);
	}
}