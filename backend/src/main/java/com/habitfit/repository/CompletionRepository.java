package com.habitfit.repository;

import com.habitfit.entity.Completion;
import com.habitfit.entity.Habit;
import com.habitfit.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface CompletionRepository extends JpaRepository<Completion, Long> {

    Optional<Completion> findByHabitAndCompletedOn(Habit habit, LocalDate date);

    List<Completion> findByUserAndCompletedOnBetweenOrderByCompletedOnAsc(User user, LocalDate from, LocalDate to);

    /** All completion dates for one habit (used to compute streaks/rates). */
    @Query("select c.completedOn from Completion c where c.habit = :habit order by c.completedOn asc")
    List<LocalDate> findDatesByHabit(@Param("habit") Habit habit);

    @Query("select c.habit.id from Completion c where c.user = :user and c.completedOn = :date")
    List<Long> findHabitIdsCompletedOn(@Param("user") User user, @Param("date") LocalDate date);

    /** For the achievements: did the user ever complete every active habit on one day? */
    @Query("""
           select c.completedOn, count(c) from Completion c
           where c.user = :user
           group by c.completedOn
           """)
    List<Object[]> countByDayForUser(@Param("user") User user);
}
