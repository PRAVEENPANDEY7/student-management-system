const formMessage = document.getElementById('form-message');
const studentAddForm = document.getElementById('student-add-form');
const teacherAddForm = document.getElementById('teacher-add-form');
const reviewCard = document.getElementById('review-card');
const reviewContent = document.getElementById('review-content');
const editButton = document.getElementById('edit-button');
const confirmButton = document.getElementById('confirm-button');

let pendingSubmission = null;

function setFormMessage(message, type = 'info') {
  formMessage.textContent = message;
  formMessage.className = `status-banner ${type}`;
  formMessage.hidden = false;
}

function clearFormMessage() {
  formMessage.hidden = true;
  formMessage.textContent = '';
  formMessage.className = 'status-banner';
}

function readQueryMessage() {
  const params = new URLSearchParams(window.location.search);
  const error = params.get('error');
  if (error) {
    setFormMessage(error, 'error');
  }
}

function showReview(items) {
  reviewContent.innerHTML = '';
  items.forEach(({ label, value }) => {
    const block = document.createElement('div');
    block.className = 'review-item';
    block.innerHTML = `<label>${label}</label><p>${value}</p>`;
    reviewContent.appendChild(block);
  });
  reviewCard.hidden = false;
}

function startReview(config) {
  pendingSubmission = config;
  clearFormMessage();
  config.form.hidden = true;
  showReview(config.reviewItems);
}

function closeReview() {
  if (!pendingSubmission) {
    return;
  }
  reviewCard.hidden = true;
  pendingSubmission.form.hidden = false;
  pendingSubmission = null;
}

function savePendingSubmission() {
  if (!pendingSubmission) {
    return;
  }
  pendingSubmission.form.submit();
}

if (editButton) {
  editButton.addEventListener('click', closeReview);
}

if (confirmButton) {
  confirmButton.addEventListener('click', savePendingSubmission);
}

if (studentAddForm) {
  studentAddForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const payload = {
      name: document.getElementById('student-name').value.trim(),
      email: document.getElementById('student-email').value.trim(),
      age: Number.parseInt(document.getElementById('student-age').value, 10),
      course: document.getElementById('student-course').value.trim(),
      username: document.getElementById('student-username').value.trim()
    };

    if (Object.values(payload).some((value) => value === '' || Number.isNaN(value))) {
      setFormMessage('Please fill all student fields correctly.', 'error');
      return;
    }

    startReview({
      form: studentAddForm,
      reviewItems: [
        { label: 'Full Name', value: payload.name },
        { label: 'Email', value: payload.email },
        { label: 'Age', value: payload.age },
        { label: 'Course', value: payload.course },
        { label: 'Username', value: payload.username }
      ]
    });
  });
}

if (teacherAddForm) {
  teacherAddForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const payload = {
      name: document.getElementById('teacher-name').value.trim(),
      email: document.getElementById('teacher-email').value.trim(),
      department: document.getElementById('teacher-department').value.trim(),
      specialization: document.getElementById('teacher-specialization').value.trim(),
      qualification: document.getElementById('teacher-qualification').value.trim(),
      username: document.getElementById('teacher-username').value.trim()
    };

    if (Object.values(payload).some((value) => value === '')) {
      setFormMessage('Please fill all teacher fields correctly.', 'error');
      return;
    }

    startReview({
      form: teacherAddForm,
      reviewItems: [
        { label: 'Full Name', value: payload.name },
        { label: 'Email', value: payload.email },
        { label: 'Department', value: payload.department },
        { label: 'Specialization', value: payload.specialization },
        { label: 'Qualification', value: payload.qualification },
        { label: 'Username', value: payload.username }
      ]
    });
  });
}

document.addEventListener('DOMContentLoaded', readQueryMessage);
