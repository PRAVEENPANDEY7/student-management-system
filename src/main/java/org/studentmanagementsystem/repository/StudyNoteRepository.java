package org.studentmanagementsystem.repository;

import org.studentmanagementsystem.entity.StudyNote;
import org.studentmanagementsystem.entity.Subject;
import org.studentmanagementsystem.entity.Teacher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface StudyNoteRepository extends JpaRepository<StudyNote, Long> {
    List<StudyNote> findTop8ByTeacherOrderByCreatedAtDesc(Teacher teacher);
    List<StudyNote> findBySubjectInOrderByCreatedAtDesc(Collection<Subject> subjects);
}
