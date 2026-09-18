package com.habitfit.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * A habit owned by exactly one user. Soft-deleted via {@code active = false}.
 * Streak / completion are derived counters, recomputed from completions.
 */
@Entity
@Table(name = "habits", indexes = @Index(name = "idx_habits_user", columnList = "user_id"))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Habit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, foreignKey = @ForeignKey(name = "fk_habits_user"))
    private User user;

    @NotBlank
    @Size(max = 120)
    @Column(nullable = false, length = 120)
    private String name;

    @Size(max = 255)
    @Column(length = 255)
    @Builder.Default
    private String goal = "Daily";

    @Size(max = 10)
    @Column(length = 10)
    @Builder.Default
    private String icon = "\uD83C\uDFAF";

    @Size(max = 20)
    @Column(length = 20)
    @Builder.Default
    private String color = "#22d3a8";

    @Size(max = 50)
    @Column(name = "color_dim", length = 50)
    @Builder.Default
    private String colorDim = "rgba(34,211,168,0.12)";

    /** Derived: consecutive most-recent days with a completion, ending today or yesterday. */
    @Column(nullable = false)
    @Builder.Default
    private int streak = 0;

    /** Derived: percentage of days completed since creation. */
    @Column(nullable = false)
    @Builder.Default
    private int completion = 0;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private boolean active = true;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
