package com.ntuc.lms.model;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

//model/Member.java
@Entity
@Table(name = "MEMBER")
@Getter @Setter @NoArgsConstructor
public class Member {
 @Id
 @Column(name = "user_id")
 private Long userId;

 @OneToOne
 @MapsId
 @JoinColumn(name = "user_id")
 private User user;

 @Column(name = "member_id", nullable = false, unique = true, length = 20)
 private String memberId; // e.g., MEM-0001

 @Column(name = "join_date")
 private LocalDate joinDate = LocalDate.now();

 @Enumerated(EnumType.STRING)
 private Status status = Status.Active;

 public enum Status { Active, Suspended, Expired }
}