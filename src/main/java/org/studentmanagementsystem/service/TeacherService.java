package org.studentmanagementsystem.service;

import org.studentmanagementsystem.dto.TeacherSignupRequest;
import org.studentmanagementsystem.entity.Teacher;
import org.studentmanagementsystem.entity.User;
import org.studentmanagementsystem.repository.TeacherRepository;
import org.studentmanagementsystem.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class TeacherService {

    @Autowired private TeacherRepository teacherRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private PasswordEncoder passwordEncoder;

    public Optional<Teacher> getTeacherByUsername(String username) {
        return userRepository.findByUsername(username).flatMap(teacherRepository::findByUser);
    }

    public boolean existsByUsername(String username) {
        return userRepository.existsByUsername(username);
    }

    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    public Teacher registerTeacher(TeacherSignupRequest request) {
        User user = new User();
        user.setUsername(request.getUsername());
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole("ROLE_TEACHER");

        Teacher teacher = new Teacher();
        teacher.setName(request.getName());
        teacher.setEmail(request.getEmail());
        teacher.setDepartment(request.getDepartment());
        teacher.setSpecialization(request.getSpecialization());
        teacher.setQualification(request.getQualification());
        teacher.setUser(user);

        return teacherRepository.save(teacher);
    }
}
