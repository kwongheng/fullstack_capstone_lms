package com.ntuc.lms.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ntuc.lms.model.Member;
import com.ntuc.lms.services.MemberService;

import lombok.RequiredArgsConstructor;

//controller/MemberController.java
@RestController
@RequestMapping("/api/members")
@RequiredArgsConstructor
public class MemberController {

	private final MemberService memberService;

	@GetMapping
	public ResponseEntity<List<Member>> getAllMembers() {
		return ResponseEntity.ok(memberService.getAllMembers());
	}

	@GetMapping("/{userId}")
	public ResponseEntity<Member> getMemberByUserId(@PathVariable Integer userId) {
		return ResponseEntity.ok(memberService.getByUserId(userId));
	}

	@PostMapping
	public ResponseEntity<Member> createMember(@RequestBody MemberRequest request) {
		Member member = memberService.createMember(request.userId(), request.memberId());
		return ResponseEntity.status(HttpStatus.CREATED).body(member);
	}

	@PatchMapping("/{userId}/status")
	public ResponseEntity<Member> updateMemberStatus(@PathVariable Integer userId,
			@RequestBody UpdateStatusRequest request) {

		Member member = memberService.getByUserId(userId);
		member.setStatus(Member.Status.valueOf(request.status()));
		Member updated = memberService.updateMemberStatus(member); // we'll add this method

		return ResponseEntity.ok(updated);
	}

	record UpdateStatusRequest(String status) {
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> deleteNotAllowed() {
		return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
	}

}

//Simple DTO to avoid exposing User entity directly
record MemberRequest(Integer userId, String memberId) {
}