package com.habitfit.service;

import com.habitfit.dto.HabitDtos.CalendarResponse;
import com.habitfit.dto.HabitDtos.CreateHabitRequest;
import com.habitfit.dto.HabitDtos.HabitResponse;
import com.habitfit.dto.HabitDtos.ToggleResponse;
import com.habitfit.entity.Completion;
import com.habitfit.entity.Habit;
import com.habitfit.entity.User;
import com.habitfit.repository.CompletionRepository;
import com.habitfit.repository.HabitRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

/**
 * Habit business logic: CRUD, daily toggling with streak recomputation,
 * calendar aggregation, and completion-rate calculation.
 */
@Service
public class HabitService {

    private final HabitRepository habitRepo;
    private final CompletionRepository compRepo;

    public HabitService(HabitRepository habitRepo, CompletionRepository compRepo) {
        this.habitRepo = habitRepo;
        this.compRepo = compRepo;
    }

    /* ── Queries ─────────────────────────────────────────────────────────── */

    @Transactional(readOnly = true)
    public List<HabitResponse> getHabits(User user) {
        LocalDate today = LocalDate.now();
        List<Long> todayIds = compRepo.findHabitIdsCompletedOn(user, today);
        return habitRepo.findByUserAndActiveTrueOrderByCreatedAtAsc(user).stream()
                .map(h -> toResponse(h, todayIds.contains(h.getId())))
                .toList();
    }

    @Transactional(readOnly = true)
    public CalendarResponse getCalendar(User user, LocalDate from, LocalDate to) {
        Map<String, List<Long>> days = new TreeMap<>();
        for (Completion c : compRepo.findByUserAndCompletedOnBetweenOrderByCompletedOnAsc(user, from, to)) {
            days.computeIfAbsent(c.getCompletedOn().toString(), k -> new ArrayList<>())
                .add(c.getHabit().getId());
        }
        int total = habitRepo.findByUserAndActiveTrue(user).size();
        return new CalendarResponse(days, total);
    }

    /* ── Commands ────────────────────────────────────────────────────────── */

    @Transactional
    public HabitResponse addHabit(User user, CreateHabitRequest req) {
        if (habitRepo.existsByUserAndNameIgnoreCase(user, req.getName().trim())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "You already have a habit with this name.");
        }

        Habit habit = Habit.builder()
                .user(user)
                .name(req.getName().trim())
                .goal(req.getGoal() != null && !req.getGoal().isBlank() ? req.getGoal().trim() : "Daily")
                .icon(req.getIcon() != null && !req.getIcon().isBlank() ? req.getIcon() : "\uD83C\uDFAF")
                .color(req.getColor() != null ? req.getColor() : "#22d3a8")
                .colorDim(req.getColorDim() != null ? req.getColorDim() : "rgba(34,211,168,0.12)")
                .streak(0)
                .completion(0)
                .build();
        habitRepo.save(habit);
        return toResponse(habit, false);
    }

    /** Mark/unmark done for today. Recomputes streak and completion % from history. */
    @Transactional
    public ToggleResponse toggle(User user, Long habitId) {
        Habit habit = habitRepo.findByIdAndUser(habitId, user)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Habit not found."));

        LocalDate today = LocalDate.now();
        var existing = compRepo.findByHabitAndCompletedOn(habit, today);

        boolean nowDone;
        if (existing.isPresent()) {
            compRepo.delete(existing.get());
            nowDone = false;
        } else {
            compRepo.save(Completion.builder()
                    .habit(habit)
                    .user(user)
                    .completedOn(today)
                    .build());
            nowDone = true;
        }

        recomputeDerived(habit);
        habitRepo.save(habit);

        String msg = nowDone ? "Habit marked done. Streak: " + habit.getStreak() + "🔥"
                             : "Habit unmarked.";
        return new ToggleResponse(habit.getId(), nowDone, habit.getStreak(), habit.getCompletion(), msg);
    }

    /** Soft delete: keep completion history for stats, hide the habit. */
    @Transactional
    public void deleteHabit(User user, Long habitId) {
        Habit habit = habitRepo.findByIdAndUser(habitId, user)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Habit not found."));
        habit.setActive(false);
        habitRepo.save(habit);
    }

    /* ── Derived counters ────────────────────────────────────────────────── */

    /**
     * Streak = consecutive days with a completion ending today (if done today)
     * or yesterday (if not yet done today). Completion % = days completed
     * since the habit was created / days elapsed.
     */
    private void recomputeDerived(Habit habit) {
        List<LocalDate> dates = compRepo.findDatesByHabit(habit);
        LocalDate today = LocalDate.now();

        // Streak: walk backwards from the anchor day
        LocalDate anchor = dates.contains(today) ? today : today.minusDays(1);
        int streak = 0;
        LocalDate cursor = anchor;
        while (dates.contains(cursor)) {
            streak++;
            cursor = cursor.minusDays(1);
        }
        habit.setStreak(streak);

        // Completion %: completed days / days since creation (inclusive), capped 0..100
        long totalDays = Math.max(1, java.time.temporal.ChronoUnit.DAYS.between(
                habit.getCreatedAt().toLocalDate(), today) + 1);
        int pct = (int) Math.min(100, Math.round(dates.size() * 100.0 / totalDays));
        habit.setCompletion(pct);
    }

    /* ── Mapping ─────────────────────────────────────────────────────────── */

    private HabitResponse toResponse(Habit h, boolean done) {
        HabitResponse r = new HabitResponse();
        r.setId(h.getId());
        r.setName(h.getName());
        r.setGoal(h.getGoal());
        r.setIcon(h.getIcon());
        r.setColor(h.getColor());
        r.setColorDim(h.getColorDim());
        r.setStreak(h.getStreak());
        r.setCompletion(h.getCompletion());
        r.setDone(done);
        r.setCreatedAt(h.getCreatedAt().atZone(ZoneId.systemDefault()).toLocalDate().toString());
        return r;
    }
}
