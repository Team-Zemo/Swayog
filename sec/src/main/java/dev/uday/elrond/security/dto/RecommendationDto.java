package dev.uday.elrond.security.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RecommendationDto {
    private String poseName;
    private String difficulty; // Beginner, Intermediate, Advanced
    private String reason; // "Based on your level", "To improve accuracy", "Try something new"
}
