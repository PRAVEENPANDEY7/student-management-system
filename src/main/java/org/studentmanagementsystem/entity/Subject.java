package org.studentmanagementsystem.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(
        name = "subjects",
        indexes = {
                @Index(name = "idx_subjects_code", columnList = "code"),
                @Index(name = "idx_subjects_course", columnList = "course")
        }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Subject {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 30)
    private String code;

    @Column(nullable = false, length = 120)
    private String name;

    @Column(nullable = false, length = 120)
    private String course;

    @Column(length = 30)
    private String semester;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "teacher_id",
            foreignKey = @ForeignKey(name = "fk_subjects_teacher")
    )
    private Teacher teacher;
}
