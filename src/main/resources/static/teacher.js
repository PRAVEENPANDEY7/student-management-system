const teacherToken = localStorage.getItem('token');
const teacherRole = localStorage.getItem('role');
const teacherStatus = document.getElementById('teacher-status');

let teacherDashboard = null;

if (!teacherToken || teacherRole !== 'ROLE_TEACHER') {
  window.location.href = 'index.html';
}

function setStatus(message, type = 'info') {
  teacherStatus.textContent = message;
  teacherStatus.className = `status-banner ${type}`;
  teacherStatus.hidden = false;
}

function clearStatus() {
  teacherStatus.hidden = true;
  teacherStatus.textContent = '';
  teacherStatus.className = 'status-banner';
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

async function readResponse(response) {
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return response.json();
  }
  const text = await response.text();
  return text ? { message: text } : {};
}

async function apiFetch(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${teacherToken}`,
      ...(options.headers || {})
    }
  });

  if (response.status === 401 || response.status === 403) {
    logout();
    throw new Error('Session expired.');
  }

  const data = await readResponse(response);
  if (!response.ok) {
    throw new Error(data.error || data.message || data.detail || 'Request failed');
  }
  return data;
}

async function loadDashboard() {
  teacherDashboard = await apiFetch('/api/teacher/dashboard');
  renderDashboard();
}

function renderDashboard() {
  const { profile, subjects, recentSessions, notes } = teacherDashboard;
  document.getElementById('teacher-heading').textContent = `Welcome, ${profile.name}`;

  document.getElementById('teacher-stats').innerHTML = `
    <article class="stat-card"><span class="stat-label">Subjects</span><strong>${subjects.length}</strong></article>
    <article class="stat-card"><span class="stat-label">Students</span><strong>${subjects.reduce((sum, subject) => sum + subject.students.length, 0)}</strong></article>
    <article class="stat-card"><span class="stat-label">Notes Posted</span><strong>${notes.length}</strong></article>
  `;

  renderSelects(subjects);
  renderAttendanceRows();
  renderSubjects(subjects);
  renderActivity(recentSessions, notes);
}

function renderSelects(subjects) {
  const options = subjects.length
    ? subjects.map((subject) => `<option value="${subject.id}">${escapeHtml(subject.code)} - ${escapeHtml(subject.name)}</option>`).join('')
    : '<option value="">Create a subject first</option>';

  document.getElementById('note-subject').innerHTML = options;
  document.getElementById('attendance-subject').innerHTML = options;
}

function renderAttendanceRows() {
  const subjectId = Number.parseInt(document.getElementById('attendance-subject').value, 10);
  const subject = teacherDashboard.subjects.find((item) => item.id === subjectId);
  const rows = document.getElementById('attendance-rows');
  const empty = document.getElementById('attendance-empty');

  if (!subject || subject.students.length === 0) {
    rows.innerHTML = '';
    empty.hidden = false;
    return;
  }

  empty.hidden = true;
  rows.innerHTML = subject.students.map((student) => `
    <tr data-student-id="${student.id}">
      <td>${escapeHtml(student.name)}</td>
      <td>${escapeHtml(student.email)}</td>
      <td>
        <select class="attendance-status">
          <option value="PRESENT">Present</option>
          <option value="ABSENT">Absent</option>
          <option value="LATE">Late</option>
        </select>
      </td>
      <td><input class="attendance-remarks" placeholder="Optional"></td>
    </tr>
  `).join('');
}

function renderSubjects(subjects) {
  const container = document.getElementById('subject-list');
  if (subjects.length === 0) {
    container.innerHTML = '<p class="empty-state">No subjects yet. Create your first subject above.</p>';
    return;
  }

  container.innerHTML = subjects.map((subject) => `
    <article class="record-card">
      <div>
        <strong>${escapeHtml(subject.code)} - ${escapeHtml(subject.name)}</strong>
        <p>${escapeHtml(subject.course)}${subject.semester ? `, ${escapeHtml(subject.semester)}` : ''}</p>
      </div>
      <span class="pill-tag">${subject.students.length} students</span>
    </article>
  `).join('');
}

function renderActivity(sessions, notes) {
  const sessionItems = sessions.map((session) => `
    <article class="record-card">
      <div>
        <strong>${escapeHtml(session.subject)} attendance</strong>
        <p>${escapeHtml(session.classDate)} ${session.topic ? `- ${escapeHtml(session.topic)}` : ''}</p>
      </div>
    </article>
  `).join('');

  const noteItems = notes.map((note) => `
    <article class="record-card">
      <div>
        <strong>${escapeHtml(note.title)}</strong>
        <p>${escapeHtml(note.subject)} - ${escapeHtml(note.description || 'Study note')}</p>
      </div>
    </article>
  `).join('');

  document.getElementById('activity-list').innerHTML =
    sessionItems || noteItems
      ? `${sessionItems}${noteItems}`
      : '<p class="empty-state">No activity yet. Mark attendance or publish notes to start.</p>';
}

function getFormValue(id) {
  return document.getElementById(id).value.trim();
}

function logout() {
  localStorage.clear();
  window.location.href = 'index.html';
}

document.getElementById('attendance-date').valueAsDate = new Date();
document.getElementById('attendance-subject').addEventListener('change', renderAttendanceRows);

document.getElementById('subject-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  try {
    setStatus('Creating subject...', 'info');
    await apiFetch('/api/teacher/subjects', {
      method: 'POST',
      body: JSON.stringify({
        code: getFormValue('subject-code'),
        name: getFormValue('subject-name'),
        course: getFormValue('subject-course'),
        semester: getFormValue('subject-semester')
      })
    });
    event.target.reset();
    await loadDashboard();
    setStatus('Subject created and matching students enrolled.', 'success');
  } catch (error) {
    setStatus(error.message || 'Unable to create subject.', 'error');
  }
});

document.getElementById('note-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  try {
    setStatus('Publishing notes...', 'info');
    await apiFetch('/api/teacher/notes', {
      method: 'POST',
      body: JSON.stringify({
        subjectId: Number.parseInt(getFormValue('note-subject'), 10),
        title: getFormValue('note-title'),
        description: getFormValue('note-description'),
        content: getFormValue('note-content'),
        attachmentUrl: getFormValue('note-link')
      })
    });
    event.target.reset();
    await loadDashboard();
    setStatus('Notes published for students.', 'success');
  } catch (error) {
    setStatus(error.message || 'Unable to publish notes.', 'error');
  }
});

document.getElementById('attendance-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const rows = [...document.querySelectorAll('#attendance-rows tr')];
  if (rows.length === 0) {
    setStatus('No students are enrolled in this subject yet.', 'error');
    return;
  }

  try {
    setStatus('Saving attendance...', 'info');
    await apiFetch('/api/teacher/attendance', {
      method: 'POST',
      body: JSON.stringify({
        subjectId: Number.parseInt(getFormValue('attendance-subject'), 10),
        classDate: getFormValue('attendance-date'),
        topic: getFormValue('attendance-topic'),
        records: rows.map((row) => ({
          studentId: Number.parseInt(row.dataset.studentId, 10),
          status: row.querySelector('.attendance-status').value,
          remarks: row.querySelector('.attendance-remarks').value.trim()
        }))
      })
    });
    document.getElementById('attendance-topic').value = '';
    await loadDashboard();
    setStatus('Attendance saved successfully.', 'success');
  } catch (error) {
    setStatus(error.message || 'Unable to save attendance.', 'error');
  }
});

document.addEventListener('DOMContentLoaded', async () => {
  try {
    setStatus('Loading teacher workspace...', 'info');
    await loadDashboard();
    clearStatus();
  } catch (error) {
    setStatus(error.message || 'Unable to load teacher workspace.', 'error');
  }
});
