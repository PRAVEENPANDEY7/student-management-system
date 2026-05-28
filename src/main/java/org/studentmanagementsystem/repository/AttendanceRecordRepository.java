package org.studentmanagementsystem.repository;

import org.studentmanagementsystem.entity.AttendanceRecord;
import org.studentmanagementsystem.entity.AttendanceSession;
import org.studentmanagementsystem.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AttendanceRecordRepository extends JpaRepository<AttendanceRecord, Long> {
    List<AttendanceRecord> findBySessionOrderByStudentNameAsc(AttendanceSession session);
    List<AttendanceRecord> findByStudentOrderBySessionClassDateDesc(Student student);
}
