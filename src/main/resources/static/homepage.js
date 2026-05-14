function showThanksModal(message) {
  const modal = document.createElement('div');
  modal.className = 'thanks-modal';
  modal.innerHTML = `
    <div class="thanks-card">
      <span class="eyebrow">Welcome</span>
      <h2>${message}</h2>
      <p>Your information has been saved successfully.</p>
      <button class="btn btn-primary btn-inline" id="thanks-close" type="button">Continue</button>
    </div>
  `;

  document.body.appendChild(modal);
  modal.querySelector('#thanks-close').addEventListener('click', () => {
    modal.remove();
    history.replaceState({}, '', '/index.html');
  });
}

function renderPublicTable(items, bodyId, emptyId, columns) {
  const body = document.getElementById(bodyId);
  const empty = document.getElementById(emptyId);
  if (!body || !empty) {
    return;
  }

  body.innerHTML = '';
  empty.hidden = items.length !== 0;

  items.forEach((item) => {
    const row = document.createElement('tr');
    row.innerHTML = columns.map((column) => `<td>${item[column] || '-'}</td>`).join('');
    body.appendChild(row);
  });
}

async function loadOverview() {
  try {
    const response = await fetch('http://localhost:8083/api/public/overview');
    if (!response.ok) {
      return;
    }

    const data = await response.json();
    renderPublicTable(data.students || [], 'public-student-body', 'public-student-empty', ['name', 'email', 'course']);
    renderPublicTable(data.teachers || [], 'public-teacher-body', 'public-teacher-empty', ['name', 'email', 'department']);
  } catch (error) {
    console.error(error);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const cards = document.querySelectorAll('.reveal-card');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.2 });

  cards.forEach((card) => observer.observe(card));

  const params = new URLSearchParams(window.location.search);
  const thanks = params.get('thanks');
  if (thanks) {
    showThanksModal(thanks);
  }

  loadOverview();
});
