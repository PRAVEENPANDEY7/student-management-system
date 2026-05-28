package org.studentmanagementsystem.service;

import org.studentmanagementsystem.dto.AttendanceRequest;
import org.studentmanagementsystem.dto.StudyNoteRequest;
import org.studentmanagementsystem.dto.SubjectRequest;
import org.studentmanagementsystem.entity.*;
import org.studentmanagementsystem.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class AcademicService {

    @Autowired private StudentRepository studentRepository;
    @Autowired private TeacherRepository teacherRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private SubjectRepository subjectRepository;
    @Autowired private EnrollmentRepository enrollmentRepository;
    @Autowired private AttendanceSessionRepository attendanceSessionRepository;
    @Autowired private AttendanceRecordRepository attendanceRecordRepository;
    @Autowired private StudyNoteRepository studyNoteRepository;

    @Transactional
    public void enrollStudentInMatchingSubjects(Student student) {
        List<Subject> subjects = subjectRepository.findByCourseIgnoreCaseOrderByNameAsc(student.getCourse());
        for (Subject subject : subjects) {
            enrollIfMissing(student, subject);
        }
    }

    @Transactional
    public Map<String, Object> getStudentDashboard(String username) {
        Student student = getStudent(username);
        List<Subject> subjects = enrollmentRepository.findByStudent(student).stream()
                .map(Enrollment::getSubject)
                .sorted(Comparator.comparing(Subject::getName, String.CASE_INSENSITIVE_ORDER))
                .toList();
        List<AttendanceRecord> records = attendanceRecordRepository.findByStudentOrderBySessionClassDateDesc(student);
        List<StudyNote> notes = subjects.isEmpty()
                ? List.of()
                : studyNoteRepository.findBySubjectInOrderByCreatedAtDesc(subjects);

        return Map.of(
                "profile", studentProfile(student),
                "subjects", subjects.stream().map(this::subjectSummary).toList(),
                "attendance", buildAttendanceSummary(subjects, records),
                "recentAttendance", records.stream().limit(12).map(this::attendanceRecordSummary).toList(),
                "notes", notes.stream().limit(12).map(this::noteSummary).toList()
        );
    }

    @Transactional
    public Map<String, Object> getTeacherDashboard(String username) {
        Teacher teacher = getTeacher(username);
        List<Subject> subjects = subjectRepository.findByTeacherOrderByNameAsc(teacher);
        List<Map<String, Object>> subjectViews = subjects.stream()
                .map(subject -> {
                    Map<String, Object> view = new LinkedHashMap<>(subjectSummary(subject));
                    view.put("students", enrollmentRepository.findBySubjectOrderByStudentNameAsc(subject).stream()
                            .map(enrollment -> studentProfile(enrollment.getStudent()))
                            .toList());
                    return view;
                })
                .toList();

        return Map.of(
                "profile", teacherProfile(teacher),
                "subjects", subjectViews,
                "recentSessions", attendanceSessionRepository.findTop8ByTeacherOrderByClassDateDescCreatedAtDesc(teacher)
                        .stream().map(this::sessionSummary).toList(),
                "notes", studyNoteRepository.findTop8ByTeacherOrderByCreatedAtDesc(teacher)
                        .stream().map(this::noteSummary).toList()
        );
    }

    @Transactional
    public Map<String, Object> createSubject(String username, SubjectRequest request) {
        Teacher teacher = getTeacher(username);
        String code = required(request.code(), "Subject code").toUpperCase(Locale.ROOT);
        if (subjectRepository.existsByCodeIgnoreCase(code)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Subject code already exists");
        }

        Subject subject = new Subject();
        subject.setCode(code);
        subject.setName(required(request.name(), "Subject name"));
        subject.setCourse(required(request.course(), "Course"));
        subject.setSemester(clean(request.semester()));
        subject.setTeacher(teacher);
        Subject saved = subjectRepository.save(subject);

        studentRepository.findAll().stream()
                .filter(student -> sameText(student.getCourse(), saved.getCourse()))
                .forEach(student -> enrollIfMissing(student, saved));

        return subjectSummary(saved);
    }

    @Transactional
    public Map<String, Object> markAttendance(String username, AttendanceRequest request) {
        Teacher teacher = getTeacher(username);
        Subject subject = getOwnedSubject(teacher, request.subjectId());
        LocalDate classDate = request.classDate() == null || request.classDate().isBlank()
                ? LocalDate.now()
                : LocalDate.parse(request.classDate());

        AttendanceSession session = new AttendanceSession();
        session.setTeacher(teacher);
        session.setSubject(subject);
        session.setClassDate(classDate);
        session.setTopic(clean(request.topic()));
        AttendanceSession savedSession = attendanceSessionRepository.save(session);

        Map<Long, AttendanceRequest.AttendanceEntry> submitted = Optional.ofNullable(request.records()).orElse(List.of())
                .stream()
                .filter(entry -> entry.studentId() != null)
                .collect(Collectors.toMap(
                        AttendanceRequest.AttendanceEntry::studentId,
                        Function.identity(),
                        (first, ignored) -> first
                ));

        List<Enrollment> enrollments = enrollmentRepository.findBySubject(subject);
        for (Enrollment enrollment : enrollments) {
            AttendanceRequest.AttendanceEntry entry = submitted.get(enrollment.getStudent().getId());
            AttendanceRecord record = new AttendanceRecord();
            record.setSession(savedSession);
            record.setStudent(enrollment.getStudent());
            record.setStatus(normalizeStatus(entry == null ? "ABSENT" : entry.status()));
            record.setRemarks(entry == null ? null : clean(entry.remarks()));
            attendanceRecordRepository.save(record);
        }

        return Map.of(
                "message", "Attendance saved",
                "session", sessionSummary(savedSession),
                "records", attendanceRecordRepository.findBySessionOrderByStudentNameAsc(savedSession)
                        .stream().map(this::attendanceRecordSummary).toList()
        );
    }

    @Transactional
    public Map<String, Object> createNote(String username, StudyNoteRequest request) {
        Teacher teacher = getTeacher(username);
        Subject subject = getOwnedSubject(teacher, request.subjectId());

        StudyNote note = new StudyNote();
        note.setTeacher(teacher);
        note.setSubject(subject);
        note.setTitle(required(request.title(), "Title"));
        note.setDescription(clean(request.description()));
        note.setContent(required(request.content(), "Notes content"));
        note.setAttachmentUrl(clean(request.attachmentUrl()));
        return noteSummary(studyNoteRepository.save(note));
    }

    private Student getStudent(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        return studentRepository.findByUser(user)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Student profile not found"));
    }

    private Teacher getTeacher(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        return teacherRepository.findByUser(user)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Teacher profile not found"));
    }

    private Subject getOwnedSubject(Teacher teacher, Long subjectId) {
        if (subjectId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Subject is required");
        }
        Subject subject = subjectRepository.findById(subjectId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Subject not found"));
        if (subject.getTeacher() == null || !Objects.equals(subject.getTeacher().getId(), teacher.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can manage only your assigned subjects");
        }
        return subject;
    }

    private void enrollIfMissing(Student student, Subject subject) {
        if (!enrollmentRepository.existsByStudentAndSubject(student, subject)) {
            Enrollment enrollment = new Enrollment();
            enrollment.setStudent(student);
            enrollment.setSubject(subject);
            enrollmentRepository.save(enrollment);
        }
    }

    private List<Map<String, Object>> buildAttendanceSummary(List<Subject> subjects, List<AttendanceRecord> records) {
        return subjects.stream().map(subject -> {
            List<AttendanceRecord> subjectRecords = records.stream()
                    .filter(record -> Objects.equals(record.getSession().getSubject().getId(), subject.getId()))
                    .toList();
            long present = subjectRecords.stream()
                    .filter(record -> "PRESENT".equals(record.getStatus()))
                    .count();
            long total = subjectRecords.size();
            int percentage = total == 0 ? 0 : Math.round((present * 100f) / total);

            Map<String, Object> summary = new LinkedHashMap<>(subjectSummary(subject));
            summary.put("present", present);
            summary.put("total", total);
            summary.put("percentage", percentage);
            return summary;
        }).toList();
    }

    private Map<String, Object> studentProfile(Student student) {
        return Map.of(
                "id", student.getId(),
                "name", student.getName(),
                "email", student.getEmail(),
                "age", student.getAge() == null ? "" : student.getAge(),
                "course", student.getCourse() == null ? "" : student.getCourse(),
                "username", student.getUser().getUsername()
        );
    }

    private Map<String, Object> teacherProfile(Teacher teacher) {
        return Map.of(
                "id", teacher.getId(),
                "name", teacher.getName(),
                "email", teacher.getEmail(),
                "department", teacher.getDepartment(),
                "specialization", teacher.getSpecialization() == null ? "" : teacher.getSpecialization(),
                "qualification", teacher.getQualification() == null ? "" : teacher.getQualification(),
                "username", teacher.getUser().getUsername()
        );
    }

    private Map<String, Object> subjectSummary(Subject subject) {
        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("id", subject.getId());
        summary.put("code", subject.getCode());
        summary.put("name", subject.getName());
        summary.put("course", subject.getCourse());
        summary.put("semester", subject.getSemester() == null ? "" : subject.getSemester());
        summary.put("teacher", subject.getTeacher() == null ? "Not assigned" : subject.getTeacher().getName());
        return summary;
    }

    private Map<String, Object> sessionSummary(AttendanceSession session) {
        return Map.of(
                "id", session.getId(),
                "subject", session.getSubject().getName(),
                "subjectCode", session.getSubject().getCode(),
                "classDate", session.getClassDate().toString(),
                "topic", session.getTopic() == null ? "" : session.getTopic()
        );
    }

    private Map<String, Object> attendanceRecordSummary(AttendanceRecord record) {
        return Map.of(
                "id", record.getId(),
                "student", record.getStudent().getName(),
                "subject", record.getSession().getSubject().getName(),
                "subjectCode", record.getSession().getSubject().getCode(),
                "classDate", record.getSession().getClassDate().toString(),
                "topic", record.getSession().getTopic() == null ? "" : record.getSession().getTopic(),
                "status", record.getStatus(),
                "remarks", record.getRemarks() == null ? "" : record.getRemarks()
        );
    }

    private Map<String, Object> noteSummary(StudyNote note) {
        return Map.of(
                "id", note.getId(),
                "subject", note.getSubject().getName(),
                "subjectCode", note.getSubject().getCode(),
                "teacher", note.getTeacher().getName(),
                "title", note.getTitle(),
                "description", note.getDescription() == null ? "" : note.getDescription(),
                "content", note.getContent(),
                "attachmentUrl", note.getAttachmentUrl() == null ? "" : note.getAttachmentUrl(),
                "createdAt", note.getCreatedAt().toString()
        );
    }

    private String normalizeStatus(String status) {
        String normalized = clean(status);
        if (normalized == null) {
            return "ABSENT";
        }
        normalized = normalized.toUpperCase(Locale.ROOT);
        if (!Set.of("PRESENT", "ABSENT", "LATE").contains(normalized)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Attendance status must be PRESENT, ABSENT, or LATE");
        }
        return normalized;
    }

    private String required(String value, String label) {
        String cleaned = clean(value);
        if (cleaned == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, label + " is required");
        }
        return cleaned;
    }

    private String clean(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }

    private boolean sameText(String left, String right) {
        return left != null && right != null && left.trim().equalsIgnoreCase(right.trim());
    }
}
