package org.studentmanagementsystem.repository;

import org.studentmanagementsystem.entity.Subject;
import org.studentmanagementsystem.entity.Teacher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubjectRepository extends JpaRepository<Subject, Long> {
    List<Subject> findByTeacher(Teacher teacher);
    List<Subject> findByTeacherOrderByNameAsc(Teacher teacher);
    List<Subject> findByCourseIgnoreCaseOrderByNameAsc(String course);
    Optional<Subject> findByCodeIgnoreCase(String code);
    boolean existsByCodeIgnoreCase(String code);
}
