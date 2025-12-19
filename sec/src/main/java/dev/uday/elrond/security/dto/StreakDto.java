package dev.uday.elrond.security.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class StreakDto {
    private int currentStreak;
    private int maxStreak;
    private LocalDate lastPracticeDate;
}
