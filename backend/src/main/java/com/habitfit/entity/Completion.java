package com.habitfit.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * One row per (habit, day) the habit was marked done. The unique constraint
 * makes toggling idempotent at the database level.
 */
@Entity
@Table(name = "completions",
       uniqueConstraints = @UniqueConstraint(name = "uq_habit_day", columnNames = {"habit_id", "completed_on"}),
       indexes = {
           @Index(name = "idx_completions_user", columnList = "user_id"),
           @Index(name = "idx_completions_date", columnList = "completed_on")
       })
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Completion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "habit_id", nullable = false, foreignKey = @ForeignKey(name = "fk_comp_habit"))
    private Habit habit;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, foreignKey = @ForeignKey(name = "fk_comp_user"))
    private User user;

    @Column(name = "completed_on", nullable = false)
    private LocalDate completedOn;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
