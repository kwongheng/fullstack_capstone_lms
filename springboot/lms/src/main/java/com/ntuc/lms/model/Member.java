package com.ntuc.lms.model;

import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.*;
import lombok.*;

//model/Member.java
@Entity
@Table(name = "MEMBER")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Member {

    @Id
    @Column(name = "user_id")
    private Integer userId;

    @Column(name = "member_id", nullable = false, unique = true, length = 20)
    private String memberId;

    @Column(name = "join_date", nullable = false, columnDefinition = "DATE DEFAULT CURRENT_DATE")
    @Builder.Default
    private LocalDate joinDate = LocalDate.now();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, columnDefinition = "ENUM('Active','Suspended','Expired') DEFAULT 'Active'")
    @Builder.Default
    private Status status = Status.Active;

    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true)
    @MapsId
    @JoinColumn(name = "user_id")
    private User user;

    public enum Status {
        Active, Suspended, Expired
    }
    
}
