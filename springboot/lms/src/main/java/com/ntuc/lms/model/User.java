
package com.ntuc.lms.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

//model/User.java 
@Entity
@Table(name = "USER")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(UserEntityListener.class)  // This triggers auto-creation
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Email
    @NotBlank
    @Column(nullable = false, unique = true, length = 255)
    private String email;

    @NotBlank
    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    @NotBlank
    @Column(name = "full_name", nullable = false, length = 255)
    private String fullName;

    @NotBlank
    @Pattern(regexp = "^[1-9][0-9]*$", message = "Phone must contain only digits and cannot start with 0")
    @Column(nullable = false, length = 20)
    private String phone;

    @Column(columnDefinition = "TEXT")
    private String address;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, columnDefinition = "ENUM('Admin','Member') DEFAULT 'Member'")
    @Builder.Default
    private Role role = Role.Member;

    public enum Role {
        Admin, Member
    }
}