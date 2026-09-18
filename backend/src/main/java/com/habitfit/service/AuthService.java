package com.habitfit.service;

import com.habitfit.dto.AuthDtos.AuthResponse;
import com.habitfit.dto.AuthDtos.GoogleRequest;
import com.habitfit.dto.AuthDtos.LoginRequest;
import com.habitfit.dto.AuthDtos.SignupRequest;
import com.habitfit.entity.User;
import com.habitfit.repository.UserRepository;
import com.habitfit.security.JwtUtil;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

/**
 * Authentication flows: signup, login, and Google sign-in.
 * Passwords are BCrypt-hashed; tokens are stateless JWTs.
 */
@Service
public class AuthService {

    private final UserRepository userRepo;
    private final PasswordEncoder encoder;
    private final JwtUtil jwtUtil;

    public AuthService(UserRepository userRepo, PasswordEncoder encoder, JwtUtil jwtUtil) {
        this.userRepo = userRepo;
        this.encoder = encoder;
        this.jwtUtil = jwtUtil;
    }

    @Transactional
    public AuthResponse signup(SignupRequest req) {
        String email = req.getEmail().trim().toLowerCase();
        if (userRepo.existsByEmailIgnoreCase(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "An account with this email already exists.");
        }

        User user = User.builder()
                .name(req.getName().trim())
                .email(email)
                .password(encoder.encode(req.getPassword()))
                .provider(User.Provider.EMAIL)
                .build();
        userRepo.save(user);
        return toResponse(user, "email");
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest req) {
        String email = req.getEmail().trim().toLowerCase();
        User user = userRepo.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password."));

        if (user.getPassword() == null || !encoder.matches(req.getPassword(), user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid email or password.");
        }
        return toResponse(user, "email");
    }

    /**
     * Google sign-in: fetches no Google credentials server-side — the frontend
     * obtains the Google profile and we upsert a user record, then issue our JWT.
     */
    @Transactional
    public AuthResponse googleSignIn(GoogleRequest req) {
        String email = req.getEmail().trim().toLowerCase();
        User user = userRepo.findByEmailIgnoreCase(email).orElseGet(() -> {
            User u = User.builder()
                    .name(req.getName().trim())
                    .email(email)
                    .picture(req.getPicture())
                    .provider(User.Provider.GOOGLE)
                    .build();
            return userRepo.save(u);
        });

        // Refresh the picture URL on every sign-in if provided
        if (req.getPicture() != null && !req.getPicture().equals(user.getPicture())) {
            user.setPicture(req.getPicture());
            userRepo.save(user);
        }
        return toResponse(user, "google");
    }

    private AuthResponse toResponse(User user, String provider) {
        String token = jwtUtil.generate(user.getEmail());
        return new AuthResponse(token, user.getName(), user.getEmail(), user.getPicture(), provider);
    }
}
