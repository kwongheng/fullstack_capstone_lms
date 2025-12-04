package com.ntuc.lms.model;

import jakarta.persistence.PostPersist;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.ntuc.lms.repository.MemberRepository;

@Component
public class UserEntityListener {

    private static MemberRepository memberRepository;

    @Autowired
    public void init(MemberRepository memberRepository) {
        UserEntityListener.memberRepository = memberRepository;
    }

    @PostPersist
    @Transactional
    public void createMemberIfNeeded(User user) {
        if (user.getRole() == User.Role.Member) {
            Member member = new Member();
            member.setUser(user);  // This auto-sets userId via @MapsId
            member.setMemberId("MEM-%04d".formatted(user.getId()));
            member.setJoinDate(java.time.LocalDate.now());
            member.setStatus(Member.Status.Active);
            memberRepository.save(member);
        }
    }
}