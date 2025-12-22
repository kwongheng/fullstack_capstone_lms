package com.ntuc.lms.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authorization.AuthorizationDecision;
import org.springframework.security.authorization.AuthorizationManager;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.access.intercept.RequestAuthorizationContext;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.ntuc.lms.security.JwtAuthenticationFilter;

import java.util.function.Supplier;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    private static final String SUPER_EMAIL = "super@admin.com";

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    private AuthorizationManager<RequestAuthorizationContext> superUserAuthorizationManager() {
        return (Supplier<Authentication> authenticationSupplier, RequestAuthorizationContext context) -> {
            Authentication authentication = authenticationSupplier.get();

            if (authentication == null || !authentication.isAuthenticated()) {
                return new AuthorizationDecision(false);
            }

            boolean isSuperUser = SUPER_EMAIL.equals(authentication.getName());
            return new AuthorizationDecision(isSuperUser);
        };
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http,
                                                    JwtAuthenticationFilter jwtAuthenticationFilter) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Public
                .requestMatchers("/api/users/login").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/users").permitAll()

                // Authenticated only
                .requestMatchers(HttpMethod.GET, "/api/books/**").authenticated()

                // Super user only - use {id} instead of /**/
                .requestMatchers("/api/borrows/{id}/super-edit-dates").access(superUserAuthorizationManager())
                .requestMatchers("/api/reservations/{id}/super-edit-reservation-date").access(superUserAuthorizationManager())
                .requestMatchers("/api/members/{userId}/join-date").access(superUserAuthorizationManager())
                .requestMatchers("/api/members/{userId}/renew").access(superUserAuthorizationManager())

                // Admin only - book CRUD
                .requestMatchers(HttpMethod.POST, "/api/books").hasAuthority("ROLE_Admin")
                .requestMatchers(HttpMethod.PUT, "/api/books/**").hasAuthority("ROLE_Admin")
                .requestMatchers(HttpMethod.PATCH, "/api/books/**").hasAuthority("ROLE_Admin")
                .requestMatchers(HttpMethod.DELETE, "/api/books/**").hasAuthority("ROLE_Admin")

                // Admin only - full user/member access
                .requestMatchers("/api/users").hasAuthority("ROLE_Admin")
                .requestMatchers("/api/members").hasAuthority("ROLE_Admin")

                // All authenticated - borrows and reservations (NO /** here!)
                .requestMatchers("/api/borrows", "/api/reservations").authenticated()

                // Fallback
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}