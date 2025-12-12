// src/test/java/com/ntuc/lms/services/UserServiceTest.java
package com.ntuc.lms.services;

import com.ntuc.lms.model.User;
import com.ntuc.lms.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    private UserService userService;

    @BeforeEach
    void setUp() {
        userService = new UserService(userRepository, passwordEncoder);
    }

    @Test
    void registerUser_Success() {
        // Arrange
        User user = User.builder()
                .email("test@example.com")
                .passwordHash("plainPassword")
                .fullName("Test User")
                .phone("123456789")
                .address("Test Address")
                .role(User.Role.Member)
                .build();

        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.empty());
        when(passwordEncoder.encode("plainPassword")).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        User savedUser = userService.registerUser(user);

        // Assert
        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());

        User captured = userCaptor.getValue();
        assertThat(captured.getPasswordHash()).isEqualTo("encodedPassword");
        assertThat(savedUser.getEmail()).isEqualTo("test@example.com");
    }

    @Test
    void registerUser_EmailAlreadyExists_ThrowsConflict() {
        // Arrange
        User user = User.builder()
                .email("existing@example.com")
                .passwordHash("password")
                .build();

        when(userRepository.findByEmail("existing@example.com")).thenReturn(Optional.of(new User()));

        // Act & Assert
        assertThatThrownBy(() -> userService.registerUser(user))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Email is already registered");
    }
}