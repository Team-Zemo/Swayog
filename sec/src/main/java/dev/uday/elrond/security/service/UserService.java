package dev.uday.elrond.security.service;

import dev.uday.elrond.security.dto.StreakDto;
import dev.uday.elrond.security.dto.UserProfileDto;
import dev.uday.elrond.security.model.User;
import dev.uday.elrond.security.model.UserProfile;
import dev.uday.elrond.security.model.UserStreak;
import dev.uday.elrond.security.repository.UserProfileRepository;
import dev.uday.elrond.security.repository.UserRepository;
import dev.uday.elrond.security.repository.UserStreakRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final UserStreakRepository userStreakRepository;

    public UserProfileDto getProfile(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        UserProfile profile = userProfileRepository.findByUser(user)
                .orElse(new UserProfile()); // Return empty profile if not set

        UserProfileDto dto = new UserProfileDto();
        dto.setBio(profile.getBio());
        dto.setAge(profile.getAge());
        dto.setGender(profile.getGender());
        dto.setHeight(profile.getHeight());
        dto.setWeight(profile.getWeight());
        dto.setExperienceLevel(profile.getExperienceLevel());
        return dto;
    }

    @Transactional
    public UserProfileDto updateProfile(String username, UserProfileDto dto) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        UserProfile profile = userProfileRepository.findByUser(user)
                .orElse(new UserProfile());
        
        if (profile.getUser() == null) {
            profile.setUser(user);
        }

        profile.setBio(dto.getBio());
        profile.setAge(dto.getAge());
        profile.setGender(dto.getGender());
        profile.setHeight(dto.getHeight());
        profile.setWeight(dto.getWeight());
        profile.setExperienceLevel(dto.getExperienceLevel());

        userProfileRepository.save(profile);
        return dto;
    }

    public StreakDto getStreak(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        UserStreak streak = userStreakRepository.findByUser(user)
                .orElse(new UserStreak());
        
        StreakDto dto = new StreakDto();
        dto.setCurrentStreak(streak.getCurrentStreak());
        dto.setMaxStreak(streak.getMaxStreak());
        dto.setLastPracticeDate(streak.getLastPracticeDate());
        return dto;
    }

    @Transactional
    public StreakDto updateStreak(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        UserStreak streak = userStreakRepository.findByUser(user)
                .orElse(new UserStreak());

        if (streak.getUser() == null) {
            streak.setUser(user);
        }

        LocalDate today = LocalDate.now();
        LocalDate lastDate = streak.getLastPracticeDate();

        if (lastDate == null) {
            streak.setCurrentStreak(1);
            streak.setMaxStreak(1);
        } else if (lastDate.equals(today.minusDays(1))) {
            // Consecutive day
            streak.setCurrentStreak(streak.getCurrentStreak() + 1);
            if (streak.getCurrentStreak() > streak.getMaxStreak()) {
                streak.setMaxStreak(streak.getCurrentStreak());
            }
        } else if (lastDate.isBefore(today.minusDays(1))) {
            // Streak broken
            streak.setCurrentStreak(1);
        }
        // If lastDate is today, do nothing (already counted)

        streak.setLastPracticeDate(today);
        userStreakRepository.save(streak);

        StreakDto dto = new StreakDto();
        dto.setCurrentStreak(streak.getCurrentStreak());
        dto.setMaxStreak(streak.getMaxStreak());
        dto.setLastPracticeDate(streak.getLastPracticeDate());
        return dto;
    }
}
