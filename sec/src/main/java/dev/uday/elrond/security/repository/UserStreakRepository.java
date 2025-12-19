package dev.uday.elrond.security.repository;

import dev.uday.elrond.security.model.UserStreak;
import dev.uday.elrond.security.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserStreakRepository extends JpaRepository<UserStreak, UUID> {
    Optional<UserStreak> findByUser(User user);
}
