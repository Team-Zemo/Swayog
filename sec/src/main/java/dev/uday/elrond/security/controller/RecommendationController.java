package dev.uday.elrond.security.controller;

import dev.uday.elrond.security.dto.PracticeSessionDto;
import dev.uday.elrond.security.dto.RecommendationDto;
import dev.uday.elrond.security.service.RecommendationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/practice")
@RequiredArgsConstructor
public class RecommendationController {

    private final RecommendationService recommendationService;

    @PostMapping("/log")
    public ResponseEntity<Void> logSession(Authentication authentication, @RequestBody PracticeSessionDto dto) {
        recommendationService.logSession(authentication.getName(), dto);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/recommendations")
    public ResponseEntity<List<RecommendationDto>> getRecommendations(Authentication authentication) {
        return ResponseEntity.ok(recommendationService.getRecommendations(authentication.getName()));
    }
}
