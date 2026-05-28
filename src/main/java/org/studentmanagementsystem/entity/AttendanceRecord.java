package org.studentmanagementsystem.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(
        name = "attendance_records",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_attendance_records_session_student",
                columnNames = {"session_id", "student_id"}
        ),
        indexes = {
                @Index(name = "idx_attendance_records_student", columnList = "student_id"),
                @Index(name = "idx_attendance_records_status", columnList = "status")
        }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(
            name = "session_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_attendance_records_session")
    )
    private AttendanceSession session;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(
            name = "student_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_attendance_records_student")
    )
    private Student student;

    @Column(nullable = false, length = 20)
    private String status;

    @Column(length = 180)
    private String remarks;
}
