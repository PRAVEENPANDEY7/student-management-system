package org.studentmanagementsystem.repository;

import org.studentmanagementsystem.entity.AttendanceSession;
import org.studentmanagementsystem.entity.Subject;
import org.studentmanagementsystem.entity.Teacher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface AttendanceSessionRepository extends JpaRepository<AttendanceSession, Long> {
    List<AttendanceSession> findTop8ByTeacherOrderByClassDateDescCreatedAtDesc(Teacher teacher);
    List<AttendanceSession> findBySubjectInOrderByClassDateDescCreatedAtDesc(Collection<Subject> subjects);
}
