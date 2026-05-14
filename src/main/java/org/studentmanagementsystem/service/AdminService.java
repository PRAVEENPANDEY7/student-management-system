package org.studentmanagementsystem.service;

import org.studentmanagementsystem.entity.LoginLog;
import org.studentmanagementsystem.entity.Student;
import org.studentmanagementsystem.entity.Teacher;
import org.studentmanagementsystem.entity.User;
import org.studentmanagementsystem.repository.LoginLogRepository;
import org.studentmanagementsystem.repository.StudentRepository;
import org.studentmanagementsystem.repository.TeacherRepository;
import org.studentmanagementsystem.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AdminService {

    @Autowired private StudentRepository studentRepository;
    @Autowired private TeacherRepository teacherRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private LoginLogRepository loginLogRepository;

    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }

    public void deleteStudent(Long id) {
        studentRepository.findById(id).ifPresent(student -> {
            User user = student.getUser();
            studentRepository.delete(student);
            if (user != null) userRepository.delete(user);
        });
    }

    public List<Teacher> getAllTeachers() {
        return teacherRepository.findAll();
    }

    public void deleteTeacher(Long id) {
        teacherRepository.findById(id).ifPresent(teacher -> {
            User user = teacher.getUser();
            teacherRepository.delete(teacher);
            if (user != null) userRepository.delete(user);
        });
    }

    public List<LoginLog> getAllLogs() {
        return loginLogRepository.findAll();
    }
}
