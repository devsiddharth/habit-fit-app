package com.habitfit.repository;

import com.habitfit.entity.Habit;
import com.habitfit.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface HabitRepository extends JpaRepository<Habit, Long> {

    List<Habit> findByUserAndActiveTrueOrderByCreatedAtAsc(User user);

    List<Habit> findByUserAndActiveTrue(User user);

    Optional<Habit> findByIdAndUser(Long id, User user);

    boolean existsByUserAndNameIgnoreCase(User user, String name);
}
