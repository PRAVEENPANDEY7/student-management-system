package org.studentmanagementsystem.dto;

import lombok.Data;

@Data
public class TeacherSignupRequest {
    private String username;
    private String password;
    private String name;
    private String email;
    private String department;
    private String specialization;
    private String qualification;
}
