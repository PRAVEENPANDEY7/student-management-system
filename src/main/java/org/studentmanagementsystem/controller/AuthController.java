package org.studentmanagementsystem.controller;

import org.studentmanagementsystem.dto.AuthRequest;
import org.studentmanagementsystem.dto.AuthResponse;
import org.studentmanagementsystem.dto.SignupRequest;
import org.studentmanagementsystem.dto.TeacherSignupRequest;
import org.studentmanagementsystem.entity.LoginLog;
import org.studentmanagementsystem.repository.LoginLogRepository;
import org.studentmanagementsystem.security.JwtUtil;
import org.studentmanagementsystem.service.StudentService;
import org.studentmanagementsystem.service.TeacherService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired private AuthenticationManager authenticationManager;
    @Autowired private JwtUtil jwtUtil;
    @Autowired private StudentService studentService;
    @Autowired private TeacherService teacherService;
    @Autowired private LoginLogRepository loginLogRepository;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        String token = jwtUtil.generateToken((org.springframework.security.core.userdetails.UserDetails) authentication.getPrincipal());
        String role = authentication.getAuthorities().iterator().next().getAuthority();

        LoginLog log = new LoginLog(null, request.getUsername(), role, LocalDateTime.now());
        loginLogRepository.save(log);

        return ResponseEntity.ok(new AuthResponse(token, role));
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody SignupRequest request) {
        if (studentService.existsByUsername(request.getUsername())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Username already exists"));
        }
        if (studentService.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email already exists"));
        }
        studentService.registerStudent(request);
        return ResponseEntity.ok(Map.of("message", "Signup successful! Please login."));
    }

    @PostMapping("/teacher/signup")
    public ResponseEntity<?> teacherSignup(@RequestBody TeacherSignupRequest request) {
        if (teacherService.existsByUsername(request.getUsername())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Username already exists"));
        }
        if (teacherService.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email already exists"));
        }
        teacherService.registerTeacher(request);
        return ResponseEntity.ok(Map.of("message", "Teacher account created successfully. Please login."));
    }
}
