package dev.uday.elrond.security.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class PracticeSessionDto {
    private String poseName;
    private Double averageAccuracy;
    private Integer durationSeconds;
    private LocalDateTime practicedAt;
}
