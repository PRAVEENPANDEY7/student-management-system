package org.studentmanagementsystem.repository;

import org.studentmanagementsystem.entity.Enrollment;
import org.studentmanagementsystem.entity.Student;
import org.studentmanagementsystem.entity.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {
    List<Enrollment> findByStudent(Student student);
    List<Enrollment> findBySubject(Subject subject);
    List<Enrollment> findBySubjectOrderByStudentNameAsc(Subject subject);
    boolean existsByStudentAndSubject(Student student, Subject subject);
}
