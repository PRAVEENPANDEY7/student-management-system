const token = localStorage.getItem('token');
const role = localStorage.getItem('role');
const adminStatus = document.getElementById('admin-status');
const studentBody = document.getElementById('student-table-body');
const teacherBody = document.getElementById('teacher-table-body');
const logsBody = document.getElementById('logs-table-body');
const studentEmpty = document.getElementById('student-empty');
const teacherEmpty = document.getElementById('teacher-empty');
const logsEmpty = document.getElementById('logs-empty');
const studentSearch = document.getElementById('student-search');
const teacherSearch = document.getElementById('teacher-search');

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
      <td>${student.name}</td>
      <td>${student.email}</td>
      <td>${student.course || '-'}</td>
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
      <td>${teacher.name}</td>
      <td>${teacher.email}</td>
      <td>${teacher.department || '-'}</td>
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
      <td>${log.username}</td>
      <td>${log.role}</td>
      <td>${new Date(log.loginTime).toLocaleString()}</td>
    `;
    logsBody.appendChild(row);
  });
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
    await Promise.all([loadStudents(), loadTeachers(), loadLogs()]);
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
