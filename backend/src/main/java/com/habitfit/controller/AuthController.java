package com.habitfit.controller;

import com.habitfit.dto.AuthDtos.AuthResponse;
import com.habitfit.dto.AuthDtos.GoogleRequest;
import com.habitfit.dto.AuthDtos.LoginRequest;
import com.habitfit.dto.AuthDtos.MeResponse;
import com.habitfit.dto.AuthDtos.SignupRequest;
import com.habitfit.entity.User;
import com.habitfit.repository.UserRepository;
import com.habitfit.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepo;

    public AuthController(AuthService authService, UserRepository userRepo) {
        this.authService = authService;
        this.userRepo = userRepo;
    }

    /** Session restore: the React app calls this on page refresh with the stored JWT. */
    @GetMapping("/me")
    public ResponseEntity<MeResponse> me(@AuthenticationPrincipal String email) {
        User user = userRepo.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                        org.springframework.http.HttpStatus.UNAUTHORIZED, "User no longer exists."));
        String provider = user.getProvider() == User.Provider.GOOGLE ? "google" : "email";
        return ResponseEntity.ok(new MeResponse(user.getName(), user.getEmail(), user.getPicture(), provider));
    }

    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> signup(@Valid @RequestBody SignupRequest req) {
        return ResponseEntity.status(201).body(authService.signup(req));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest req) {
        return ResponseEntity.ok(authService.login(req));
    }

    @PostMapping("/google")
    public ResponseEntity<AuthResponse> google(@Valid @RequestBody GoogleRequest req) {
        return ResponseEntity.ok(authService.googleSignIn(req));
    }
}
