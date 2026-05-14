package org.studentmanagementsystem.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "login_logs",
        indexes = {
                @Index(name = "idx_login_logs_username", columnList = "username"),
                @Index(name = "idx_login_logs_role", columnList = "role"),
                @Index(name = "idx_login_logs_login_time", columnList = "loginTime")
        }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String username;
    
    @Column(nullable = false, length = 30)
    private String role;
    
    @Column(nullable = false)
    private LocalDateTime loginTime;
}
