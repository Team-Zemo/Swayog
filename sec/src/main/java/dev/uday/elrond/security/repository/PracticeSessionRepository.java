package dev.uday.elrond.security.repository;

import dev.uday.elrond.security.model.PracticeSession;
import dev.uday.elrond.security.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PracticeSessionRepository extends JpaRepository<PracticeSession, UUID> {
    List<PracticeSession> findByUserOrderByPracticedAtDesc(User user);
    
    @Query("SELECT p FROM PracticeSession p WHERE p.user = :user ORDER BY p.practicedAt DESC LIMIT 5")
    List<PracticeSession> findRecentSessions(User user);
}
