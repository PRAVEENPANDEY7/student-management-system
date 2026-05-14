package org.studentmanagementsystem.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
        name = "students",
        indexes = {
                @Index(name = "idx_students_email", columnList = "email"),
                @Index(name = "idx_students_course", columnList = "course")
        }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Student {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 120)
    private String name;

    @Column(unique = true, nullable = false, length = 120)
    private String email;

    private Integer age;
    
    @Column(length = 120)
    private String course;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(
            name = "user_id",
            unique = true,
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_students_user")
    )
    private User user;
}
