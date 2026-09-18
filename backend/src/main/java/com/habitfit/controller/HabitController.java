package com.habitfit.controller;

import com.habitfit.dto.HabitDtos.CalendarResponse;
import com.habitfit.dto.HabitDtos.CreateHabitRequest;
import com.habitfit.dto.HabitDtos.HabitResponse;
import com.habitfit.dto.HabitDtos.ToggleResponse;
import com.habitfit.entity.User;
import com.habitfit.repository.UserRepository;
import com.habitfit.service.HabitService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.List;

@RestController
@RequestMapping("/api/habits")
public class HabitController {

    private final HabitService habitService;
    private final UserRepository userRepo;

    public HabitController(HabitService habitService, UserRepository userRepo) {
        this.habitService = habitService;
        this.userRepo = userRepo;
    }

    /** The JWT filter stores the user's email as the principal. */
    private User currentUser(String email) {
        return userRepo.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                        org.springframework.http.HttpStatus.UNAUTHORIZED, "User no longer exists."));
    }

    @GetMapping
    public List<HabitResponse> getHabits(@AuthenticationPrincipal String email) {
        return habitService.getHabits(currentUser(email));
    }

    @PostMapping
    public ResponseEntity<HabitResponse> addHabit(@AuthenticationPrincipal String email,
                                                  @Valid @RequestBody CreateHabitRequest req) {
        return ResponseEntity.status(201).body(habitService.addHabit(currentUser(email), req));
    }

    @PostMapping("/{id}/toggle")
    public ToggleResponse toggle(@AuthenticationPrincipal String email, @PathVariable Long id) {
        return habitService.toggle(currentUser(email), id);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteHabit(@AuthenticationPrincipal String email, @PathVariable Long id) {
        habitService.deleteHabit(currentUser(email), id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/calendar")
    public CalendarResponse calendar(@AuthenticationPrincipal String email,
                                     @RequestParam(required = false) String from,
                                     @RequestParam(required = false) String to) {
        LocalDate end   = parseDate(to,   LocalDate.now());
        LocalDate start = parseDate(from, end.minusDays(365));
        return habitService.getCalendar(currentUser(email), start, end);
    }

    private static LocalDate parseDate(String value, LocalDate fallback) {
        if (value == null || value.isBlank()) return fallback;
        try {
            return LocalDate.parse(value);
        } catch (DateTimeParseException e) {
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.BAD_REQUEST, "Invalid date. Use YYYY-MM-DD.");
        }
    }
}
