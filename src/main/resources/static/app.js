const statusMessage = document.getElementById('status-message');
const loginForm = document.getElementById('login-form');
const studentForm = document.getElementById('student-form');
const teacherForm = document.getElementById('teacher-form');
const formTitle = document.getElementById('form-title');
const formSubtitle = document.getElementById('form-subtitle');

const tabConfig = {
  login: {
    title: 'Welcome Back',
    subtitle: 'Login if you already have an account, or choose a signup form.'
  },
  student: {
    title: 'Student Signup',
    subtitle: 'Submit your student details first, then continue to the college website.'
  },
  teacher: {
    title: 'Teacher Signup',
    subtitle: 'Submit your teacher details first, then continue to the college website.'
  }
};

function setStatus(message, type = 'info') {
  statusMessage.textContent = message;
  statusMessage.className = `status-banner ${type}`;
  statusMessage.hidden = false;
}

function clearStatus() {
  statusMessage.hidden = true;
  statusMessage.textContent = '';
  statusMessage.className = 'status-banner';
}

function switchTab(tab) {
  loginForm.hidden = tab !== 'login';
  studentForm.hidden = tab !== 'student';
  teacherForm.hidden = tab !== 'teacher';

  document.getElementById('login-tab').classList.toggle('active', tab === 'login');
  document.getElementById('student-tab').classList.toggle('active', tab === 'student');
  document.getElementById('teacher-tab').classList.toggle('active', tab === 'teacher');

  formTitle.textContent = tabConfig[tab].title;
  formSubtitle.textContent = tabConfig[tab].subtitle;
  clearStatus();
}

async function readResponse(response) {
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return response.json();
  }
  const text = await response.text();
  return text ? { message: text } : {};
}

async function submitJson(url, payload) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const data = await readResponse(response);
  if (!response.ok) {
    throw new Error(data.error || data.message || 'Request failed');
  }
  return data;
}

function goToPortal(message, type = 'success') {
  sessionStorage.setItem('portalMessage', message);
  sessionStorage.setItem('portalMessageType', type);
  window.location.href = 'college-portal.html';
}

function goToRoleDashboard(role) {
  if (role === 'ROLE_ADMIN') {
    window.location.href = 'admin-dashboard.html';
    return;
  }
  if (role === 'ROLE_TEACHER') {
    window.location.href = 'teacher-dashboard.html';
    return;
  }
  window.location.href = 'student-dashboard.html';
}

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  clearStatus();

  const username = document.getElementById('login-username').value.trim();
  const password = document.getElementById('login-password').value;

  if (!username || !password) {
    setStatus('Username and password are required.', 'error');
    return;
  }

  try {
    setStatus('Checking credentials...', 'info');
    const data = await submitJson('/api/auth/login', { username, password });
    localStorage.setItem('token', data.token);
    localStorage.setItem('role', data.role);
    localStorage.setItem('username', username);
    goToRoleDashboard(data.role);
  } catch (error) {
    setStatus(error.message || 'Invalid credentials.', 'error');
  }
});

studentForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  clearStatus();

  const payload = {
    name: document.getElementById('student-name').value.trim(),
    email: document.getElementById('student-email').value.trim(),
    age: Number.parseInt(document.getElementById('student-age').value, 10),
    course: document.getElementById('student-course').value.trim(),
    username: document.getElementById('student-username').value.trim(),
    password: document.getElementById('student-password').value
  };

  if (Object.values(payload).some((value) => value === '' || Number.isNaN(value))) {
    setStatus('Please fill all student fields correctly.', 'error');
    return;
  }

  try {
    setStatus('Saving student details...', 'info');
    await submitJson('/api/auth/signup', payload);
    studentForm.reset();
    goToPortal(`Welcome, ${payload.name}. Your student record has been saved.`, 'success');
  } catch (error) {
    setStatus(error.message || 'Unable to create student account.', 'error');
  }
});

teacherForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  clearStatus();

  const payload = {
    name: document.getElementById('teacher-name').value.trim(),
    email: document.getElementById('teacher-email').value.trim(),
    department: document.getElementById('teacher-department').value.trim(),
    specialization: document.getElementById('teacher-specialization').value.trim(),
    qualification: document.getElementById('teacher-qualification').value.trim(),
    username: document.getElementById('teacher-username').value.trim(),
    password: document.getElementById('teacher-password').value
  };

  if (Object.values(payload).some((value) => value === '')) {
    setStatus('Please fill all teacher fields correctly.', 'error');
    return;
  }

  try {
    setStatus('Saving teacher details...', 'info');
    await submitJson('/api/auth/teacher/signup', payload);
    teacherForm.reset();
    goToPortal(`Welcome, ${payload.name}. Your teacher record has been saved.`, 'success');
  } catch (error) {
    setStatus(error.message || 'Unable to create teacher account.', 'error');
  }
});
