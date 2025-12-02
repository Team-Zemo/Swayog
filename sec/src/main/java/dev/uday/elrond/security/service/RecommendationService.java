package dev.uday.elrond.security.service;

import dev.uday.elrond.security.dto.PracticeSessionDto;
import dev.uday.elrond.security.dto.RecommendationDto;
import dev.uday.elrond.security.model.PracticeSession;
import dev.uday.elrond.security.model.User;
import dev.uday.elrond.security.model.UserProfile;
import dev.uday.elrond.security.repository.PracticeSessionRepository;
import dev.uday.elrond.security.repository.UserProfileRepository;
import dev.uday.elrond.security.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RecommendationService {

    private final PracticeSessionRepository practiceSessionRepository;
    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;

    // Static definition of poses and difficulties
    private static final Map<String, String> POSE_DIFFICULTY = new HashMap<>();
    static {
        POSE_DIFFICULTY.put("Mountain", "BEGINNER");
        POSE_DIFFICULTY.put("T", "BEGINNER");
        POSE_DIFFICULTY.put("Tree", "BEGINNER");
        POSE_DIFFICULTY.put("Cat-Cow", "BEGINNER");
        POSE_DIFFICULTY.put("Legs-Up-The-Wall", "BEGINNER");
        POSE_DIFFICULTY.put("Cobra", "BEGINNER");
        
        POSE_DIFFICULTY.put("Triangle", "INTERMEDIATE");
        POSE_DIFFICULTY.put("Warrior", "INTERMEDIATE");
        POSE_DIFFICULTY.put("Downward Dog", "INTERMEDIATE");
        POSE_DIFFICULTY.put("Seated", "INTERMEDIATE");
        POSE_DIFFICULTY.put("Standing", "INTERMEDIATE");
        POSE_DIFFICULTY.put("Bridge", "INTERMEDIATE");
        
        POSE_DIFFICULTY.put("Crescent_lunge", "ADVANCED");
        POSE_DIFFICULTY.put("Lotus", "ADVANCED");
        POSE_DIFFICULTY.put("Pigeon", "ADVANCED");
    }

    public void logSession(String username, PracticeSessionDto dto) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        PracticeSession session = new PracticeSession();
        session.setUser(user);
        session.setPoseName(dto.getPoseName());
        session.setAverageAccuracy(dto.getAverageAccuracy());
        session.setDurationSeconds(dto.getDurationSeconds());
        session.setPracticedAt(LocalDateTime.now());

        practiceSessionRepository.save(session);
    }

    public List<RecommendationDto> getRecommendations(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        UserProfile profile = userProfileRepository.findByUser(user).orElse(null);
        String userLevel = (profile != null && profile.getExperienceLevel() != null) 
                ? profile.getExperienceLevel() 
                : "BEGINNER";

        List<PracticeSession> recentSessions = practiceSessionRepository.findRecentSessions(user);
        List<RecommendationDto> recommendations = new ArrayList<>();

        // Strategy 1: Recommend based on level (Always give at least one from current level)
        List<String> levelPoses = POSE_DIFFICULTY.entrySet().stream()
                .filter(e -> e.getValue().equalsIgnoreCase(userLevel))
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());
        
        if (!levelPoses.isEmpty()) {
            Collections.shuffle(levelPoses);
            recommendations.add(new RecommendationDto(levelPoses.get(0), userLevel, "Matches your experience level"));
        }

        // Strategy 2: Recommend to improve (Low accuracy in recent sessions)
        Optional<PracticeSession> lowAccuracySession = recentSessions.stream()
                .filter(s -> s.getAverageAccuracy() < 70.0)
                .findFirst();
        
        if (lowAccuracySession.isPresent()) {
            String pose = lowAccuracySession.get().getPoseName();
            recommendations.add(new RecommendationDto(pose, POSE_DIFFICULTY.getOrDefault(pose, "UNKNOWN"), "Practice to improve accuracy"));
        } else {
            // If doing well, suggest a challenge (Next level)
            String nextLevel = getNextLevel(userLevel);
            List<String> challengePoses = POSE_DIFFICULTY.entrySet().stream()
                    .filter(e -> e.getValue().equalsIgnoreCase(nextLevel))
                    .map(Map.Entry::getKey)
                    .collect(Collectors.toList());
            
            if (!challengePoses.isEmpty()) {
                Collections.shuffle(challengePoses);
                recommendations.add(new RecommendationDto(challengePoses.get(0), nextLevel, "Challenge yourself"));
            }
        }

        // Strategy 3: Try something new (Pose not in recent history)
        Set<String> practicedPoses = recentSessions.stream()
                .map(PracticeSession::getPoseName)
                .collect(Collectors.toSet());
        
        List<String> newPoses = POSE_DIFFICULTY.keySet().stream()
                .filter(p -> !practicedPoses.contains(p))
                .collect(Collectors.toList());
        
        if (!newPoses.isEmpty()) {
            Collections.shuffle(newPoses);
            // Ensure we don't add duplicates
            String newPose = newPoses.get(0);
            boolean alreadyRecommended = recommendations.stream().anyMatch(r -> r.getPoseName().equals(newPose));
            if (!alreadyRecommended) {
                recommendations.add(new RecommendationDto(newPose, POSE_DIFFICULTY.getOrDefault(newPose, "UNKNOWN"), "Try something new"));
            }
        }

        // Fill up to 3 if needed
        while (recommendations.size() < 3) {
            List<String> allPoses = new ArrayList<>(POSE_DIFFICULTY.keySet());
            Collections.shuffle(allPoses);
            String randomPose = allPoses.get(0);
            boolean exists = recommendations.stream().anyMatch(r -> r.getPoseName().equals(randomPose));
            if (!exists) {
                recommendations.add(new RecommendationDto(randomPose, POSE_DIFFICULTY.getOrDefault(randomPose, "UNKNOWN"), "Daily suggestion"));
            }
        }

        return recommendations.subList(0, Math.min(recommendations.size(), 3));
    }

    private String getNextLevel(String currentLevel) {
        if ("BEGINNER".equalsIgnoreCase(currentLevel)) return "INTERMEDIATE";
        if ("INTERMEDIATE".equalsIgnoreCase(currentLevel)) return "ADVANCED";
        return "ADVANCED";
    }
}
