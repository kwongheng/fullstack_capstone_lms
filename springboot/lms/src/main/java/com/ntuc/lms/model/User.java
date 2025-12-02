package com.ntuc.lms.model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

//model/User.java
@Entity
@Table(name = "USER", uniqueConstraints = @UniqueConstraint(columnNames = "email"))
@Getter @Setter @NoArgsConstructor
public class User {
 @Id
 @GeneratedValue(strategy = GenerationType.IDENTITY)
 private Long id;

 @NotBlank
 @Email
 @Column(nullable = false, unique = true, length = 255)
 private String email;

 @NotBlank
 @Column(name = "password_hash", nullable = false)
 private String passwordHash;

 @NotBlank
 @Column(name = "full_name", nullable = false)
 private String fullName;

 @NotBlank
 @Pattern(regexp = "^[1-9][0-9]*$", message = "Phone must contain only digits and not start with 0")
 @Column(nullable = false, length = 20)
 private String phone;

 private String address;

 @Enumerated(EnumType.STRING)
 @Column(nullable = false)
 private Role role = Role.Member;

 public enum Role { Admin, Member }
}