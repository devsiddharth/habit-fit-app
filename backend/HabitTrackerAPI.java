// ─────────────────────────────────────────────────────────────────────────────
// HABIT.FIT — Java Spring Boot Backend
//
// HOW TO RUN:
//  1. Open IntelliJ / Eclipse
//  2. Create a new Spring Boot project (Spring Initializr):
//     Dependencies: Spring Web, Spring Data JPA, MySQL Driver, Spring Security, Lombok
//  3. Copy each section below into the matching package/file
//  4. Update application.properties with your MySQL credentials
//  5. Run the app → API available at http://localhost:8080
//
// ─────────────────────────────────────────────────────────────────────────────

// ══════════════════════════════════════════════════════════════════════════════
// FILE: src/main/resources/application.properties
// ══════════════════════════════════════════════════════════════════════════════
/*
spring.datasource.url=jdbc:mysql://localhost:3306/habitfit?useSSL=false&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=YOUR_MYSQL_PASSWORD
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect

server.port=8080
jwt.secret=HabitFitSuperSecretKey2025HackathonWinner
jwt.expiration=86400000
*/

// ══════════════════════════════════════════════════════════════════════════════
// FILE: src/main/java/com/habitfit/model/User.java
// ══════════════════════════════════════════════════════════════════════════════
package com.habitfit.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity @Table(name = "users")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class User {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 120)
    private String name;

    @Column(nullable = false, unique = true, length = 255)
    private String email;

    @Column(length = 255)
    private String password;          // null for Google users

    @Column(columnDefinition = "TEXT")
    private String picture;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Provider provider = Provider.EMAIL;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum Provider { EMAIL, GOOGLE }
}

// ══════════════════════════════════════════════════════════════════════════════
// FILE: src/main/java/com/habitfit/model/Habit.java
// ══════════════════════════════════════════════════════════════════════════════
package com.habitfit.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity @Table(name = "habits")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Habit {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 120)
    private String name;

    @Column(length = 255)
    private String goal = "Daily";

    @Column(length = 10)
    private String icon = "🎯";

    @Column(length = 20)
    private String color = "#22d3a8";

    @Column(name = "color_dim", length = 50)
    private String colorDim = "rgba(34,211,168,0.12)";

    @Column(nullable = false)
    private int streak = 0;         // always 0 for new habit

    @Column(nullable = false)
    private int completion = 0;     // always 0 for new habit

    @Column(name = "is_active", nullable = false)
    private boolean isActive = true;

    @Column(name = "created_at")
    private LocalDate createdAt = LocalDate.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();
}

// ══════════════════════════════════════════════════════════════════════════════
// FILE: src/main/java/com/habitfit/model/Completion.java
// ══════════════════════════════════════════════════════════════════════════════
package com.habitfit.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity @Table(name = "completions",
  uniqueConstraints = @UniqueConstraint(columnNames = {"habit_id","completed_on"}))
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Completion {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "habit_id", nullable = false)
    private Habit habit;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "completed_on", nullable = false)
    private LocalDate completedOn;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}

// ══════════════════════════════════════════════════════════════════════════════
// FILE: src/main/java/com/habitfit/dto/AuthDTO.java
// ══════════════════════════════════════════════════════════════════════════════
package com.habitfit.dto;

import lombok.Data;

public class AuthDTO {

    @Data
    public static class SignupRequest {
        private String name;
        private String email;
        private String password;
    }

    @Data
    public static class LoginRequest {
        private String email;
        private String password;
    }

    @Data
    public static class GoogleRequest {
        private String name;
        private String email;
        private String picture;
    }

    @Data
    public static class AuthResponse {
        private String token;
        private String name;
        private String email;
        private String picture;
        private String provider;

        public AuthResponse(String token, String name, String email, String picture, String provider) {
            this.token    = token;
            this.name     = name;
            this.email    = email;
            this.picture  = picture;
            this.provider = provider;
        }
    }
}

// ══════════════════════════════════════════════════════════════════════════════
// FILE: src/main/java/com/habitfit/dto/HabitDTO.java
// ══════════════════════════════════════════════════════════════════════════════
package com.habitfit.dto;

import lombok.Data;
import java.time.LocalDate;

public class HabitDTO {

    @Data
    public static class CreateRequest {
        private String name;
        private String goal;
        private String icon;
        private String color;
        private String colorDim;
    }

    @Data
    public static class HabitResponse {
        private Long    id;
        private String  name;
        private String  goal;
        private String  icon;
        private String  color;
        private String  colorDim;
        private int     streak;
        private int     completion;
        private boolean done;           // true if completed today
        private LocalDate createdAt;
    }
}

// ══════════════════════════════════════════════════════════════════════════════
// FILE: src/main/java/com/habitfit/repository/UserRepository.java
// ══════════════════════════════════════════════════════════════════════════════
package com.habitfit.repository;

import com.habitfit.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
}

// ══════════════════════════════════════════════════════════════════════════════
// FILE: src/main/java/com/habitfit/repository/HabitRepository.java
// ══════════════════════════════════════════════════════════════════════════════
package com.habitfit.repository;

import com.habitfit.model.Habit;
import com.habitfit.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface HabitRepository extends JpaRepository<Habit, Long> {
    List<Habit> findByUserAndIsActiveTrue(User user);
}

// ══════════════════════════════════════════════════════════════════════════════
// FILE: src/main/java/com/habitfit/repository/CompletionRepository.java
// ══════════════════════════════════════════════════════════════════════════════
package com.habitfit.repository;

import com.habitfit.model.Completion;
import com.habitfit.model.Habit;
import com.habitfit.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface CompletionRepository extends JpaRepository<Completion, Long> {
    Optional<Completion> findByHabitAndCompletedOn(Habit habit, LocalDate date);
    List<Completion> findByUserAndCompletedOnBetween(User user, LocalDate from, LocalDate to);

    @Query("SELECT c FROM Completion c WHERE c.user = :user AND c.completedOn = :date")
    List<Completion> findTodayByUser(User user, LocalDate date);
}

// ══════════════════════════════════════════════════════════════════════════════
// FILE: src/main/java/com/habitfit/security/JwtUtil.java
// ══════════════════════════════════════════════════════════════════════════════
package com.habitfit.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import java.security.Key;
import java.util.Date;

@Component
public class JwtUtil {
    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private long expiration;

    private Key key() { return Keys.hmacShaKeyFor(secret.getBytes()); }

    public String generate(String email) {
        return Jwts.builder()
            .setSubject(email)
            .setIssuedAt(new Date())
            .setExpiration(new Date(System.currentTimeMillis() + expiration))
            .signWith(key(), SignatureAlgorithm.HS256)
            .compact();
    }

    public String extractEmail(String token) {
        return Jwts.parserBuilder().setSigningKey(key()).build()
            .parseClaimsJws(token).getBody().getSubject();
    }

    public boolean isValid(String token) {
        try { extractEmail(token); return true; } catch (Exception e) { return false; }
    }
}

// ══════════════════════════════════════════════════════════════════════════════
// FILE: src/main/java/com/habitfit/controller/AuthController.java
// ══════════════════════════════════════════════════════════════════════════════
package com.habitfit.controller;

import com.habitfit.dto.AuthDTO.*;
import com.habitfit.model.User;
import com.habitfit.repository.UserRepository;
import com.habitfit.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    private final UserRepository  userRepo;
    private final PasswordEncoder encoder;
    private final JwtUtil         jwtUtil;

    /** POST /api/auth/signup */
    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody SignupRequest req) {
        if (userRepo.existsByEmail(req.getEmail()))
            return ResponseEntity.badRequest().body("Email already registered.");

        User user = User.builder()
            .name(req.getName())
            .email(req.getEmail())
            .password(encoder.encode(req.getPassword()))
            .provider(User.Provider.EMAIL)
            .build();
        userRepo.save(user);

        String token = jwtUtil.generate(user.getEmail());
        return ResponseEntity.ok(new AuthResponse(token, user.getName(), user.getEmail(), null, "email"));
    }

    /** POST /api/auth/login */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req) {
        User user = userRepo.findByEmail(req.getEmail())
            .orElse(null);
        if (user == null || !encoder.matches(req.getPassword(), user.getPassword()))
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid email or password.");

        String token = jwtUtil.generate(user.getEmail());
        return ResponseEntity.ok(new AuthResponse(token, user.getName(), user.getEmail(), user.getPicture(), "email"));
    }

    /** POST /api/auth/google */
    @PostMapping("/google")
    public ResponseEntity<?> google(@RequestBody GoogleRequest req) {
        User user = userRepo.findByEmail(req.getEmail()).orElseGet(() -> {
            User u = User.builder()
                .name(req.getName())
                .email(req.getEmail())
                .picture(req.getPicture())
                .provider(User.Provider.GOOGLE)
                .build();
            return userRepo.save(u);
        });

        String token = jwtUtil.generate(user.getEmail());
        return ResponseEntity.ok(new AuthResponse(token, user.getName(), user.getEmail(), user.getPicture(), "google"));
    }
}

// ══════════════════════════════════════════════════════════════════════════════
// FILE: src/main/java/com/habitfit/controller/HabitController.java
// ══════════════════════════════════════════════════════════════════════════════
package com.habitfit.controller;

import com.habitfit.dto.HabitDTO.*;
import com.habitfit.model.*;
import com.habitfit.repository.*;
import com.habitfit.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/habits")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class HabitController {

    private final HabitRepository      habitRepo;
    private final CompletionRepository compRepo;
    private final UserRepository       userRepo;
    private final JwtUtil              jwtUtil;

    private User currentUser(String authHeader) {
        String email = jwtUtil.extractEmail(authHeader.replace("Bearer ", ""));
        return userRepo.findByEmail(email).orElseThrow();
    }

    /** GET /api/habits — get all habits with today's done flag */
    @GetMapping
    public ResponseEntity<List<HabitResponse>> getHabits(@RequestHeader("Authorization") String auth) {
        User user  = currentUser(auth);
        List<Habit> habits = habitRepo.findByUserAndIsActiveTrue(user);
        Set<Long> todayIds = compRepo.findTodayByUser(user, LocalDate.now())
            .stream().map(c -> c.getHabit().getId()).collect(Collectors.toSet());

        List<HabitResponse> resp = habits.stream().map(h -> {
            HabitResponse r = new HabitResponse();
            r.setId(h.getId()); r.setName(h.getName()); r.setGoal(h.getGoal());
            r.setIcon(h.getIcon()); r.setColor(h.getColor()); r.setColorDim(h.getColorDim());
            r.setStreak(h.getStreak()); r.setCompletion(h.getCompletion());
            r.setDone(todayIds.contains(h.getId())); r.setCreatedAt(h.getCreatedAt());
            return r;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(resp);
    }

    /** POST /api/habits — add a new habit (streak=0, completion=0) */
    @PostMapping
    public ResponseEntity<HabitResponse> addHabit(
        @RequestHeader("Authorization") String auth,
        @RequestBody CreateRequest req) {

        User user = currentUser(auth);
        Habit habit = Habit.builder()
            .user(user)
            .name(req.getName())
            .goal(req.getGoal() != null ? req.getGoal() : "Daily")
            .icon(req.getIcon() != null ? req.getIcon() : "🎯")
            .color(req.getColor() != null ? req.getColor() : "#22d3a8")
            .colorDim(req.getColorDim() != null ? req.getColorDim() : "rgba(34,211,168,0.12)")
            .streak(0)       // always starts at 0
            .completion(0)   // always starts at 0
            .build();
        habitRepo.save(habit);

        HabitResponse r = new HabitResponse();
        r.setId(habit.getId()); r.setName(habit.getName()); r.setGoal(habit.getGoal());
        r.setIcon(habit.getIcon()); r.setColor(habit.getColor()); r.setColorDim(habit.getColorDim());
        r.setStreak(0); r.setCompletion(0); r.setDone(false); r.setCreatedAt(habit.getCreatedAt());
        return ResponseEntity.ok(r);
    }

    /** POST /api/habits/{id}/toggle — mark/unmark done for today */
    @PostMapping("/{id}/toggle")
    public ResponseEntity<HabitResponse> toggle(
        @RequestHeader("Authorization") String auth,
        @PathVariable Long id) {

        User  user  = currentUser(auth);
        Habit habit = habitRepo.findById(id).orElseThrow();

        LocalDate today = LocalDate.now();
        Optional<Completion> existing = compRepo.findByHabitAndCompletedOn(habit, today);

        boolean nowDone;
        if (existing.isPresent()) {
            compRepo.delete(existing.get());
            habit.setStreak(Math.max(0, habit.getStreak() - 1));
            nowDone = false;
        } else {
            compRepo.save(Completion.builder().habit(habit).user(user).completedOn(today).build());
            habit.setStreak(habit.getStreak() + 1);
            nowDone = true;
        }
        habitRepo.save(habit);

        HabitResponse r = new HabitResponse();
        r.setId(habit.getId()); r.setName(habit.getName()); r.setGoal(habit.getGoal());
        r.setIcon(habit.getIcon()); r.setColor(habit.getColor()); r.setColorDim(habit.getColorDim());
        r.setStreak(habit.getStreak()); r.setCompletion(habit.getCompletion());
        r.setDone(nowDone); r.setCreatedAt(habit.getCreatedAt());
        return ResponseEntity.ok(r);
    }

    /** DELETE /api/habits/{id} */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteHabit(
        @RequestHeader("Authorization") String auth,
        @PathVariable Long id) {
        Habit habit = habitRepo.findById(id).orElseThrow();
        habit.setActive(false);     // soft delete
        habitRepo.save(habit);
        return ResponseEntity.noContent().build();
    }

    /** GET /api/habits/calendar?from=YYYY-MM-DD&to=YYYY-MM-DD */
    @GetMapping("/calendar")
    public ResponseEntity<Map<String, List<Long>>> calendar(
        @RequestHeader("Authorization") String auth,
        @RequestParam String from,
        @RequestParam String to) {

        User user = currentUser(auth);
        List<Completion> comps = compRepo.findByUserAndCompletedOnBetween(
            user, LocalDate.parse(from), LocalDate.parse(to));

        Map<String, List<Long>> result = new TreeMap<>();
        comps.forEach(c -> {
            String key = c.getCompletedOn().toString();
            result.computeIfAbsent(key, k -> new ArrayList<>()).add(c.getHabit().getId());
        });
        return ResponseEntity.ok(result);
    }
}
