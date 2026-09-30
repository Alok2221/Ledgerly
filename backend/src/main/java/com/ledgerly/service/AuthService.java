package com.ledgerly.service;

import com.ledgerly.domain.User;
import com.ledgerly.exception.BadRequestException;
import com.ledgerly.repository.UserRepository;
import com.ledgerly.security.JwtService;
import com.ledgerly.security.UserPrincipal;
import com.ledgerly.web.dto.AuthResponse;
import com.ledgerly.web.dto.LoginRequest;
import com.ledgerly.web.dto.RegisterRequest;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmailIgnoreCase(request.email())) {
            throw new BadRequestException("An account with this email already exists");
        }
        User user = new User();
        user.setEmail(request.email().trim().toLowerCase());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setDisplayName(request.displayName().trim());
        userRepository.save(user);
        UserPrincipal principal = new UserPrincipal(user);
        return toResponse(principal, jwtService.generateToken(principal));
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.email().trim().toLowerCase(), request.password()));
        User user = userRepository
                .findByEmailIgnoreCase(request.email().trim())
                .orElseThrow();
        UserPrincipal principal = new UserPrincipal(user);
        return toResponse(principal, jwtService.generateToken(principal));
    }

    private AuthResponse toResponse(UserPrincipal principal, String token) {
        return new AuthResponse(token, principal.getId(), principal.getUsername(), principal.getDisplayName());
    }
}
