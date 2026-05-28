package org.studentmanagementsystem.dto;

public record SubjectRequest(
        String code,
        String name,
        String course,
        String semester
) {
}
