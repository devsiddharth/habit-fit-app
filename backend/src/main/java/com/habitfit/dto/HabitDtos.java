package com.habitfit.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

/** Request/response payloads for /api/habits endpoints. */
public final class HabitDtos {

    private HabitDtos() {}

    @Data
    public static class CreateHabitRequest {
        @NotBlank @Size(max = 120)
        private String name;
        @Size(max = 255)
        private String goal;
        @Size(max = 10)
        private String icon;
        @Size(max = 20)
        private String color;
        @Size(max = 50)
        private String colorDim;
    }

    @Data
    public static class HabitResponse {
        private Long id;
        private String name;
        private String goal;
        private String icon;
        private String color;
        private String colorDim;
        private int streak;
        private int completion;
        private boolean done;          // completed today
        private String createdAt;      // ISO date string YYYY-MM-DD
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ToggleResponse {
        private Long habitId;
        private boolean done;
        private int streak;
        private int completion;
        private String message;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class CalendarResponse {
        /** { "2026-09-15": [habitId, habitId] } */
        private Map<String, List<Long>> days;
        /** Active habit count used for per-day percentages. */
        private int totalHabits;
    }
}
