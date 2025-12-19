package dev.uday.elrond.security.controller;

import dev.uday.elrond.security.dto.StreakDto;
import dev.uday.elrond.security.dto.UserProfileDto;
import dev.uday.elrond.security.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/profile")
    public ResponseEntity<UserProfileDto> getProfile(Authentication authentication) {
        return ResponseEntity.ok(userService.getProfile(authentication.getName()));
    }

    @PostMapping("/profile")
    public ResponseEntity<UserProfileDto> updateProfile(Authentication authentication, @RequestBody UserProfileDto dto) {
        return ResponseEntity.ok(userService.updateProfile(authentication.getName(), dto));
    }

    @GetMapping("/streak")
    public ResponseEntity<StreakDto> getStreak(Authentication authentication) {
        return ResponseEntity.ok(userService.getStreak(authentication.getName()));
    }

    @PostMapping("/streak/update")
    public ResponseEntity<StreakDto> updateStreak(Authentication authentication) {
        return ResponseEntity.ok(userService.updateStreak(authentication.getName()));
    }
}
