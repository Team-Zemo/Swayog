package dev.uday.elrond.security.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "user_profile")
public class UserProfile {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false)
    private UUID id;

    @OneToOne
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    private User user;

    private String bio;
    private Integer age;
    private String gender;
    private Double height; // in cm
    private Double weight; // in kg
    
    @Column(name = "experience_level")
    private String experienceLevel; // BEGINNER, INTERMEDIATE, ADVANCED
}
