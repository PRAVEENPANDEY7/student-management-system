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

async function loadProfile() {
  const response = await fetch('/api/student/profile', {
    headers: { 'Authorization': `Bearer ${studentToken}` }
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
    <div class="profile-item"><label>Age</label><p>${data.age || '-'}</p></div>
    <div class="profile-item"><label>Course</label><p>${data.course || '-'}</p></div>
    <div class="profile-item"><label>Username</label><p>${data.user?.username || '-'}</p></div>
    <div class="profile-item"><label>Role</label><p>${data.user?.role || '-'}</p></div>
  `;
}

function logout() {
  localStorage.clear();
  window.location.href = 'index.html';
}

document.addEventListener('DOMContentLoaded', async () => {
  try {
    setStatus('Loading your profile...', 'info');
    await loadProfile();
    clearStatus();
  } catch (error) {
    setStatus(error.message || 'Unable to load student data.', 'error');
  }
});
