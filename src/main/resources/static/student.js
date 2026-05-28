const studentToken = localStorage.getItem('token');
const studentRole = localStorage.getItem('role');
const studentStatus = document.getElementById('student-status');

if (!studentToken || studentRole !== 'ROLE_STUDENT') {
  window.location.href = 'index.html';
}

function setStatus(message, type = 'info') {
  studentStatus.textContent = message;
  studentStatus.className = `status-banner ${type}`;
  studentStatus.hidden = false;
}

function clearStatus() {
  studentStatus.hidden = true;
  studentStatus.textContent = '';
  studentStatus.className = 'status-banner';
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

async function apiFetch(url) {
  const response = await fetch(url, {
    headers: { 'Authorization': `Bearer ${studentToken}` }
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
  const dashboard = await apiFetch('/api/student/dashboard');
  renderDashboard(dashboard);
}

function renderDashboard(dashboard) {
  const { profile, subjects, attendance, recentAttendance, notes } = dashboard;
  const totalClasses = attendance.reduce((sum, item) => sum + item.total, 0);
  const presentClasses = attendance.reduce((sum, item) => sum + item.present, 0);
  const overall = totalClasses === 0 ? 0 : Math.round((presentClasses * 100) / totalClasses);

  document.getElementById('student-heading').textContent = `Welcome, ${profile.name}`;
  document.getElementById('student-stats').innerHTML = `
    <article class="stat-card"><span class="stat-label">Subjects</span><strong>${subjects.length}</strong></article>
    <article class="stat-card"><span class="stat-label">Attendance</span><strong>${overall}%</strong></article>
    <article class="stat-card"><span class="stat-label">Notes</span><strong>${notes.length}</strong></article>
  `;

  renderSubjects(subjects);
  renderAttendance(attendance);
  renderNotes(notes);
  renderRecentAttendance(recentAttendance);
}

function renderSubjects(subjects) {
  const container = document.getElementById('subject-list');
  if (subjects.length === 0) {
    container.innerHTML = '<p class="empty-state">No subjects assigned yet. Ask your teacher to create a subject for your course.</p>';
    return;
  }

  container.innerHTML = subjects.map((subject) => `
    <article class="record-card">
      <div>
        <strong>${escapeHtml(subject.code)} - ${escapeHtml(subject.name)}</strong>
        <p>${escapeHtml(subject.course)}${subject.semester ? `, ${escapeHtml(subject.semester)}` : ''}</p>
      </div>
      <span class="pill-tag">${escapeHtml(subject.teacher)}</span>
    </article>
  `).join('');
}

function renderAttendance(attendance) {
  const container = document.getElementById('attendance-summary');
  if (attendance.length === 0) {
    container.innerHTML = '<p class="empty-state">Attendance will appear after your teacher takes a class.</p>';
    return;
  }

  container.innerHTML = attendance.map((item) => `
    <article class="attendance-card">
      <div class="attendance-card-head">
        <strong>${escapeHtml(item.subjectCode)} - ${escapeHtml(item.name)}</strong>
        <span>${item.percentage}%</span>
      </div>
      <div class="attendance-meter"><span style="width: ${item.percentage}%"></span></div>
      <p>${item.present} present out of ${item.total} classes</p>
    </article>
  `).join('');
}

function renderNotes(notes) {
  const container = document.getElementById('notes-list');
  if (notes.length === 0) {
    container.innerHTML = '<p class="empty-state">No notes uploaded yet.</p>';
    return;
  }

  container.innerHTML = notes.map((note) => `
    <article class="note-card">
      <span class="pill-tag">${escapeHtml(note.subjectCode)}</span>
      <h3>${escapeHtml(note.title)}</h3>
      <p>${escapeHtml(note.description || note.subject)}</p>
      <pre>${escapeHtml(note.content)}</pre>
      ${note.attachmentUrl ? `<a href="${escapeHtml(note.attachmentUrl)}" target="_blank" rel="noopener">Open Attachment</a>` : ''}
    </article>
  `).join('');
}

function renderRecentAttendance(records) {
  const container = document.getElementById('recent-attendance');
  if (records.length === 0) {
    container.innerHTML = '<p class="empty-state">No attendance records yet.</p>';
    return;
  }

  container.innerHTML = records.map((record) => `
    <article class="record-card">
      <div>
        <strong>${escapeHtml(record.subject)} - ${escapeHtml(record.status)}</strong>
        <p>${escapeHtml(record.classDate)} ${record.topic ? `- ${escapeHtml(record.topic)}` : ''}</p>
      </div>
      <span class="pill-tag">${escapeHtml(record.subjectCode)}</span>
    </article>
  `).join('');
}

function logout() {
  localStorage.clear();
  window.location.href = 'index.html';
}

document.addEventListener('DOMContentLoaded', async () => {
  try {
    setStatus('Loading student workspace...', 'info');
    await loadDashboard();
    clearStatus();
  } catch (error) {
    setStatus(error.message || 'Unable to load student workspace.', 'error');
  }
});
