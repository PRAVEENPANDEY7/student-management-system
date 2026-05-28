package org.studentmanagementsystem.dto;

import java.util.List;

public record AttendanceRequest(
        Long subjectId,
        String classDate,
        String topic,
        List<AttendanceEntry> records
) {
    public record AttendanceEntry(
            Long studentId,
            String status,
            String remarks
    ) {
    }
}
