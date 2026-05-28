package org.studentmanagementsystem.dto;

public record StudyNoteRequest(
        Long subjectId,
        String title,
        String description,
        String content,
        String attachmentUrl
) {
}
