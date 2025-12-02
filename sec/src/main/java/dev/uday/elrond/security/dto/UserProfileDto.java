package dev.uday.elrond.security.dto;

import lombok.Data;

@Data
public class UserProfileDto {
    private String bio;
    private Integer age;
    private String gender;
    private Double height;
    private Double weight;
    private String experienceLevel;
}
