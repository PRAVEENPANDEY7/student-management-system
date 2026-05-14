package org.studentmanagementsystem.controller;

import org.studentmanagementsystem.dto.SignupRequest;
import org.studentmanagementsystem.dto.TeacherSignupRequest;
import org.studentmanagementsystem.service.StudentService;
import org.studentmanagementsystem.service.TeacherService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Controller
public class PageController {

    @Autowired
    private StudentService studentService;

    @Autowired
    private TeacherService teacherService;

    @PostMapping("/web/register/student")
    public String registerStudent(@RequestParam String name,
                                  @RequestParam String email,
                                  @RequestParam Integer age,
                                  @RequestParam String course,
                                  @RequestParam String username,
                                  @RequestParam String password) {
        if (studentService.existsByUsername(username) || studentService.existsByEmail(email)) {
            return "redirect:/add-student.html?error=" + encode("Student username or email already exists.");
        }

        SignupRequest request = new SignupRequest();
        request.setName(name);
        request.setEmail(email);
        request.setAge(age);
        request.setCourse(course);
        request.setUsername(username);
        request.setPassword(password);
        studentService.registerStudent(request);

        return "redirect:/index.html?thanks=" + encode("Welcome, " + name + ". Thanks for sharing your information.");
    }

    @PostMapping("/web/register/teacher")
    public String registerTeacher(@RequestParam String name,
                                  @RequestParam String email,
                                  @RequestParam String department,
                                  @RequestParam String specialization,
                                  @RequestParam String qualification,
                                  @RequestParam String username,
                                  @RequestParam String password) {
        if (teacherService.existsByUsername(username) || teacherService.existsByEmail(email)) {
            return "redirect:/add-teacher.html?error=" + encode("Teacher username or email already exists.");
        }

        TeacherSignupRequest request = new TeacherSignupRequest();
        request.setName(name);
        request.setEmail(email);
        request.setDepartment(department);
        request.setSpecialization(specialization);
        request.setQualification(qualification);
        request.setUsername(username);
        request.setPassword(password);
        teacherService.registerTeacher(request);

        return "redirect:/index.html?thanks=" + encode("Welcome, " + name + ". Thanks for sharing your information.");
    }

    private String encode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }
}
