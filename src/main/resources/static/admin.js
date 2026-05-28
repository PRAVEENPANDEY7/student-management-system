const token = localStorage.getItem('token');
const role = localStorage.getItem('role');
const adminStatus = document.getElementById('admin-status');
const studentBody = document.getElementById('student-table-body');
const teacherBody = document.getElementById('teacher-table-body');
const logsBody = document.getElementById('logs-table-body');
const subjectsBody = document.getElementById('subjects-table-body');
const studentEmpty = document.getElementById('student-empty');
const teacherEmpty = document.getElementById('teacher-empty');
const logsEmpty = document.getElementById('logs-empty');
const subjectsEmpty = document.getElementById('subjects-empty');
const studentSearch = document.getElementById('student-search');
const teacherSearch = document.getElementById('teacher-search');
const adminAttendanceList = document.getElementById('admin-attendance-list');
const adminNotesList = document.getElementById('admin-notes-list');

let studentsCache = [];
let teachersCache = [];

if (!token || role !== 'ROLE_ADMIN') {
  window.location.href = 'index.html';
}

function setStatus(message, type = 'info') {
  adminStatus.textContent = message;
  adminStatus.className = `status-banner ${type}`;
  adminStatus.hidden = false;
}

function clearStatus() {
  adminStatus.hidden = true;
  adminStatus.textContent = '';
  adminStatus.className = 'status-banner';
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

async function apiFetch(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      ...(options.headers || {})
    }
  });

  if (response.status === 401 || response.status === 403) {
    logout();
    throw new Error('Session expired.');
  }

  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await response.json() : await response.text();

  if (!response.ok) {
    const message = typeof data === 'string' ? data : data.error || data.message;
    throw new Error(message || 'Request failed');
  }

  return data;
}

function renderStudents(students) {
  studentBody.innerHTML = '';
  document.getElementById('student-count').textContent = students.length;
  studentEmpty.hidden = students.length !== 0;

  students.forEach((student) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${student.id}</td>
      <td>${escapeHtml(student.name)}</td>
      <td>${escapeHtml(student.email)}</td>
      <td>${escapeHtml(student.course || '-')}</td>
      <td><button class="btn btn-danger btn-small" data-student-id="${student.id}">Delete</button></td>
    `;
    studentBody.appendChild(row);
  });
}

function renderTeachers(teachers) {
  teacherBody.innerHTML = '';
  document.getElementById('teacher-count').textContent = teachers.length;
  teacherEmpty.hidden = teachers.length !== 0;

  teachers.forEach((teacher) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${teacher.id}</td>
      <td>${escapeHtml(teacher.name)}</td>
      <td>${escapeHtml(teacher.email)}</td>
      <td>${escapeHtml(teacher.department || '-')}</td>
      <td><button class="btn btn-danger btn-small" data-teacher-id="${teacher.id}">Delete</button></td>
    `;
    teacherBody.appendChild(row);
  });
}

function filterStudents() {
  const query = studentSearch.value.trim().toLowerCase();
  const filtered = studentsCache.filter((student) =>
    [student.name, student.email, student.course]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(query))
  );
  renderStudents(filtered);
}

function filterTeachers() {
  const query = teacherSearch.value.trim().toLowerCase();
  const filtered = teachersCache.filter((teacher) =>
    [teacher.name, teacher.email, teacher.department, teacher.specialization]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(query))
  );
  renderTeachers(filtered);
}

async function loadStudents() {
  studentsCache = await apiFetch('/api/admin/students');
  renderStudents(studentsCache);
}

async function loadTeachers() {
  teachersCache = await apiFetch('/api/admin/teachers');
  renderTeachers(teachersCache);
}

async function loadLogs() {
  const logs = await apiFetch('/api/admin/logs');
  logsBody.innerHTML = '';
  document.getElementById('log-count').textContent = logs.length;
  logsEmpty.hidden = logs.length !== 0;

  logs.forEach((log) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${escapeHtml(log.username)}</td>
      <td>${escapeHtml(log.role)}</td>
      <td>${new Date(log.loginTime).toLocaleString()}</td>
    `;
    logsBody.appendChild(row);
  });
}

async function loadAcademicOverview() {
  const academic = await apiFetch('/api/admin/academic');
  document.getElementById('subject-count').textContent = academic.subjectCount;
  document.getElementById('attendance-count').textContent = academic.attendanceSessionCount;
  document.getElementById('note-count').textContent = academic.noteCount;

  subjectsBody.innerHTML = '';
  subjectsEmpty.hidden = academic.subjects.length !== 0;
  academic.subjects.forEach((subject) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${escapeHtml(subject.code)}</td>
      <td>${escapeHtml(subject.name)}</td>
      <td>${escapeHtml(subject.course)}${subject.semester ? `, ${escapeHtml(subject.semester)}` : ''}</td>
      <td>${escapeHtml(subject.teacher)}</td>
      <td>${subject.students}</td>
    `;
    subjectsBody.appendChild(row);
  });

  if (academic.recentAttendance.length === 0) {
    adminAttendanceList.innerHTML = '<p class="empty-state">No attendance has been submitted yet. Login as teacher, create a subject, then mark attendance.</p>';
  } else {
    adminAttendanceList.innerHTML = academic.recentAttendance.map((session) => `
      <article class="record-card">
        <div>
          <strong>${escapeHtml(session.subjectCode)} - ${escapeHtml(session.subject)}</strong>
          <p>${escapeHtml(session.classDate)} ${session.topic ? `- ${escapeHtml(session.topic)}` : ''}</p>
          <p>${escapeHtml(session.teacher)} marked ${session.records} students.</p>
        </div>
      </article>
    `).join('');
  }

  if (academic.recentNotes.length === 0) {
    adminNotesList.innerHTML = '<p class="empty-state">No notes uploaded yet. Login as teacher and publish notes from the teacher workspace.</p>';
  } else {
    adminNotesList.innerHTML = academic.recentNotes.map((note) => `
      <article class="record-card">
        <div>
          <strong>${escapeHtml(note.title)}</strong>
          <p>${escapeHtml(note.subjectCode)} - ${escapeHtml(note.subject)}</p>
          <p>${escapeHtml(note.teacher)} uploaded ${new Date(note.createdAt).toLocaleString()}.</p>
        </div>
      </article>
    `).join('');
  }
}

async function deleteStudent(id) {
  if (!window.confirm('Delete this student record?')) {
    return;
  }

  try {
    setStatus('Deleting student...', 'info');
    await apiFetch(`/api/admin/students/${id}`, { method: 'DELETE' });
    await loadStudents();
    setStatus('Student deleted successfully.', 'success');
  } catch (error) {
    setStatus(error.message || 'Unable to delete student.', 'error');
  }
}

async function deleteTeacher(id) {
  if (!window.confirm('Delete this teacher record?')) {
    return;
  }

  try {
    setStatus('Deleting teacher...', 'info');
    await apiFetch(`/api/admin/teachers/${id}`, { method: 'DELETE' });
    await loadTeachers();
    setStatus('Teacher deleted successfully.', 'success');
  } catch (error) {
    setStatus(error.message || 'Unable to delete teacher.', 'error');
  }
}

function logout() {
  localStorage.clear();
  window.location.href = 'index.html';
}

document.addEventListener('DOMContentLoaded', async () => {
  try {
    setStatus('Loading campus records...', 'info');
    await Promise.all([loadStudents(), loadTeachers(), loadLogs(), loadAcademicOverview()]);
    clearStatus();
  } catch (error) {
    setStatus(error.message || 'Unable to load dashboard.', 'error');
  }
});

studentBody.addEventListener('click', (event) => {
  const button = event.target.closest('[data-student-id]');
  if (button) {
    deleteStudent(button.dataset.studentId);
  }
});

teacherBody.addEventListener('click', (event) => {
  const button = event.target.closest('[data-teacher-id]');
  if (button) {
    deleteTeacher(button.dataset.teacherId);
  }
});

studentSearch.addEventListener('input', filterStudents);
teacherSearch.addEventListener('input', filterTeachers);
