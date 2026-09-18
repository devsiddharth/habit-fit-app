package com.habitfit.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;

/** Request/response payloads for /api/auth endpoints. */
public final class AuthDtos {

    private AuthDtos() {}

    @Data
    public static class SignupRequest {
        @NotBlank @Size(max = 120)
        private String name;
        @NotBlank @Email @Size(max = 255)
        private String email;
        @NotBlank @Size(min = 6, max = 72)
        private String password;
    }

    @Data
    public static class GoogleRequest {
        @NotBlank
        private String name;
        @NotBlank @Email
        private String email;
        private String picture;
    }

    @Data
    public static class LoginRequest {
        @NotBlank @Email
        private String email;
        @NotBlank
        private String password;
    }

    @Data
    @AllArgsConstructor
    public static class AuthResponse {
        private String token;
        private String name;
        private String email;
        private String picture;
        private String provider;
    }

    /** Payload of GET /api/auth/me (session restore). */
    @Data
    @AllArgsConstructor
    public static class MeResponse {
        private String name;
        private String email;
        private String picture;
        private String provider;
    }
}
