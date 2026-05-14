package org.studentmanagementsystem;

import org.studentmanagementsystem.entity.User;
import org.studentmanagementsystem.repository.UserRepository;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
public class StudentManagementSystemApplication {
    public static void main(String[] args) {
        SpringApplication.run(StudentManagementSystemApplication.class, args);
    }

    @Bean
    public org.springframework.boot.CommandLineRunner seedAdminUser(UserRepository userRepository,
                                                                   PasswordEncoder passwordEncoder) {
        return args -> userRepository.findByUsername("admin").orElseGet(() -> {
            User admin = new User();
            admin.setUsername("admin");
            admin.setName("System Administrator");
            admin.setEmail("admin@local");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRole("ROLE_ADMIN");
            return userRepository.save(admin);
        });
    }
}
