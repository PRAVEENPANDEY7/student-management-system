const portalMessage = document.getElementById('portal-message');
const welcomeHeading = document.getElementById('welcome-heading');

function applyPortalMessage() {
  const message = sessionStorage.getItem('portalMessage');
  const type = sessionStorage.getItem('portalMessageType') || 'success';
  const username = localStorage.getItem('username');

  if (username && !message) {
    welcomeHeading.textContent = `Welcome back, ${username}.`;
  }

  if (!message) {
    return;
  }

  portalMessage.textContent = message;
  portalMessage.className = `status-banner ${type}`;
  portalMessage.hidden = false;

  if (message.toLowerCase().includes('welcome')) {
    welcomeHeading.textContent = message;
  }

  sessionStorage.removeItem('portalMessage');
  sessionStorage.removeItem('portalMessageType');
}

document.addEventListener('DOMContentLoaded', applyPortalMessage);
