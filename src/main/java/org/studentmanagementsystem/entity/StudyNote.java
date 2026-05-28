package org.studentmanagementsystem.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "study_notes",
        indexes = {
                @Index(name = "idx_study_notes_teacher", columnList = "teacher_id"),
                @Index(name = "idx_study_notes_subject", columnList = "subject_id"),
                @Index(name = "idx_study_notes_created_at", columnList = "created_at")
        }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudyNote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(
            name = "subject_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_study_notes_subject")
    )
    private Subject subject;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(
            name = "teacher_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_study_notes_teacher")
    )
    private Teacher teacher;

    @Column(nullable = false, length = 140)
    private String title;

    @Column(length = 240)
    private String description;

    @Lob
    @Column(nullable = false)
    private String content;

    @Column(length = 500)
    private String attachmentUrl;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
