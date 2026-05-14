package org.studentmanagementsystem.dto;

import lombok.Data;

@Data
public class SignupRequest {
    private String username;
    private String password;
    private String name;
    private String email;
    private Integer age;
    private String course;
}