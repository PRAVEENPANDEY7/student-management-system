const teacherToken = localStorage.getItem('token');
const teacherRole = localStorage.getItem('role');
const teacherStatus = document.getElementById('teacher-status');

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

async function loadProfile() {
  const response = await fetch('/api/teacher/profile', {
    headers: { 'Authorization': `Bearer ${teacherToken}` }
  });

  if (response.status === 401 || response.status === 403) {
    logout();
    throw new Error('Session expired.');
  }

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || data.message || 'Unable to load profile.');
  }

  const container = document.getElementById('profile-container');
  container.innerHTML = `
    <div class="profile-item"><label>Full Name</label><p>${data.name || '-'}</p></div>
    <div class="profile-item"><label>Email</label><p>${data.email || '-'}</p></div>
    <div class="profile-item"><label>Department</label><p>${data.department || '-'}</p></div>
    <div class="profile-item"><label>Specialization</label><p>${data.specialization || '-'}</p></div>
    <div class="profile-item"><label>Qualification</label><p>${data.qualification || '-'}</p></div>
    <div class="profile-item"><label>Username</label><p>${data.user?.username || '-'}</p></div>
  `;
}

function logout() {
  localStorage.clear();
  window.location.href = 'index.html';
}

document.addEventListener('DOMContentLoaded', async () => {
  try {
    setStatus('Loading your faculty profile...', 'info');
    await loadProfile();
    clearStatus();
  } catch (error) {
    setStatus(error.message || 'Unable to load teacher data.', 'error');
  }
});
