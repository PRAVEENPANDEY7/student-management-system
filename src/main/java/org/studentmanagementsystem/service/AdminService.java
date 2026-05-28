package org.studentmanagementsystem.service;

import org.studentmanagementsystem.entity.LoginLog;
import org.studentmanagementsystem.entity.Student;
import org.studentmanagementsystem.entity.Subject;
import org.studentmanagementsystem.entity.Teacher;
import org.studentmanagementsystem.entity.User;
import org.studentmanagementsystem.repository.AttendanceRecordRepository;
import org.studentmanagementsystem.repository.AttendanceSessionRepository;
import org.studentmanagementsystem.repository.EnrollmentRepository;
import org.studentmanagementsystem.repository.LoginLogRepository;
import org.studentmanagementsystem.repository.StudyNoteRepository;
import org.studentmanagementsystem.repository.StudentRepository;
import org.studentmanagementsystem.repository.SubjectRepository;
import org.studentmanagementsystem.repository.TeacherRepository;
import org.studentmanagementsystem.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
public class AdminService {

    @Autowired private StudentRepository studentRepository;
    @Autowired private TeacherRepository teacherRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private LoginLogRepository loginLogRepository;
    @Autowired private SubjectRepository subjectRepository;
    @Autowired private EnrollmentRepository enrollmentRepository;
    @Autowired private AttendanceSessionRepository attendanceSessionRepository;
    @Autowired private AttendanceRecordRepository attendanceRecordRepository;
    @Autowired private StudyNoteRepository studyNoteRepository;

    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }

    public void deleteStudent(Long id) {
        studentRepository.findById(id).ifPresent(student -> {
            User user = student.getUser();
            studentRepository.delete(student);
            if (user != null) userRepository.delete(user);
        });
    }

    public List<Teacher> getAllTeachers() {
        return teacherRepository.findAll();
    }

    public void deleteTeacher(Long id) {
        teacherRepository.findById(id).ifPresent(teacher -> {
            User user = teacher.getUser();
            teacherRepository.delete(teacher);
            if (user != null) userRepository.delete(user);
        });
    }

    public List<LoginLog> getAllLogs() {
        return loginLogRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getAcademicOverview() {
        List<Subject> subjects = subjectRepository.findAll();

        return Map.of(
                "subjectCount", subjects.size(),
                "enrollmentCount", enrollmentRepository.count(),
                "attendanceSessionCount", attendanceSessionRepository.count(),
                "attendanceRecordCount", attendanceRecordRepository.count(),
                "noteCount", studyNoteRepository.count(),
                "subjects", subjects.stream().map(subject -> Map.of(
                        "id", subject.getId(),
                        "code", subject.getCode(),
                        "name", subject.getName(),
                        "course", subject.getCourse(),
                        "semester", subject.getSemester() == null ? "" : subject.getSemester(),
                        "teacher", subject.getTeacher() == null ? "Not assigned" : subject.getTeacher().getName(),
                        "students", enrollmentRepository.findBySubject(subject).size()
                )).toList(),
                "recentAttendance", attendanceSessionRepository.findAll().stream()
                        .sorted((left, right) -> right.getClassDate().compareTo(left.getClassDate()))
                        .limit(8)
                        .map(session -> Map.of(
                                "subject", session.getSubject().getName(),
                                "subjectCode", session.getSubject().getCode(),
                                "teacher", session.getTeacher().getName(),
                                "classDate", session.getClassDate().toString(),
                                "topic", session.getTopic() == null ? "" : session.getTopic(),
                                "records", attendanceRecordRepository.findBySessionOrderByStudentNameAsc(session).size()
                        )).toList(),
                "recentNotes", studyNoteRepository.findAll().stream()
                        .sorted((left, right) -> right.getCreatedAt().compareTo(left.getCreatedAt()))
                        .limit(8)
                        .map(note -> Map.of(
                                "title", note.getTitle(),
                                "subject", note.getSubject().getName(),
                                "subjectCode", note.getSubject().getCode(),
                                "teacher", note.getTeacher().getName(),
                                "createdAt", note.getCreatedAt().toString()
                        )).toList()
        );
    }
}
