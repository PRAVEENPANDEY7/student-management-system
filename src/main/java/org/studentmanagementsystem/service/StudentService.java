package org.studentmanagementsystem.service;

import org.studentmanagementsystem.dto.SignupRequest;
import org.studentmanagementsystem.entity.Student;
import org.studentmanagementsystem.entity.User;
import org.studentmanagementsystem.repository.StudentRepository;
import org.studentmanagementsystem.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class StudentService {

    @Autowired private StudentRepository studentRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private AcademicService academicService;

    public Optional<Student> getStudentByUsername(String username) {
        Optional<User> user = userRepository.findByUsername(username);
        return user.flatMap(studentRepository::findByUser);
    }

    public boolean existsByUsername(String username) {
        return userRepository.existsByUsername(username);
    }

    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    public Student registerStudent(SignupRequest request) {
        User user = new User();
        user.setUsername(request.getUsername());
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole("ROLE_STUDENT");

        Student student = new Student();
        student.setName(request.getName());
        student.setEmail(request.getEmail());
        student.setAge(request.getAge());
        student.setCourse(request.getCourse());
        student.setUser(user);

        Student saved = studentRepository.save(student);
        academicService.enrollStudentInMatchingSubjects(saved);
        return saved;
    }
}
