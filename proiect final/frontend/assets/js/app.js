const API_BASE = 'http://localhost:3000/api';
let authState = null;
let authView = 'login';
const DEBUG_LOGS = true;

const toastContainer = document.getElementById('toastContainer');
const logoutButtons = document.querySelectorAll('[data-logout]');
const authLoginCard = document.getElementById('authLogin');
const authRegisterCard = document.getElementById('authRegister');
const authLoggedCard = document.getElementById('authLogged');
const showRegisterBtn = document.getElementById('showRegister');
const showLoginBtn = document.getElementById('showLogin');
const loggedNameEl = document.getElementById('loggedName');
const loginEmailInput = document.getElementById('loginEmail');

const mockEvents = [
  {
    id: 1,
    title: 'Demo - Conferinta Tech',
    description: 'Backend cu JWT si MySQL, prezentare arhitectura.',
    location: 'Bucuresti',
    date: new Date().toISOString(),
    price: 99,
    max_quantity: 50,
    registrations_count: 18,
  },
];

const showToast = (message, variant = 'primary') => {
  if (!toastContainer) {
    console.log(`${variant.toUpperCase()}: ${message}`);
    return;
  }
  const toastEl = document.createElement('div');
  toastEl.className = 'toast align-items-center text-white border-0 show';
  toastEl.role = 'alert';
  toastEl.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">${message}</div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
    </div>
  `;
  toastContainer.appendChild(toastEl);
  setTimeout(() => toastEl.remove(), 4000);
};

const toggleLogoutButtons = (visible) => {
  logoutButtons.forEach((btn) => {
    btn.classList.toggle('d-none', !visible);
  });
};

const redactPayload = (payload) => {
  if (!payload || typeof payload !== 'object') return payload;
  const redacted = { ...payload };
  ['password', 'oldPassword', 'newPassword', 'confirmPassword'].forEach((key) => {
    if (key in redacted) {
      redacted[key] = '***';
    }
  });
  return redacted;
};

const safeLog = (scope, data) => {
  if (!DEBUG_LOGS) return;
  try {
    console.log(`[LOG:${scope}]`, data);
  } catch (err) {
    // no-op
  }
};

const refreshAuthUI = () => {
  const loggedIn = !!authState?.user;
  if (authLoggedCard) {
    authLoggedCard.classList.toggle('d-none', !loggedIn);
  }
  if (loggedNameEl) {
    loggedNameEl.textContent = loggedIn ? authState.user?.name || 'Utilizator' : '';
  }
  if (!loggedIn) {
    if (authLoginCard) authLoginCard.classList.toggle('d-none', authView !== 'login');
    if (authRegisterCard) authRegisterCard.classList.toggle('d-none', authView !== 'register');
  } else {
    if (authLoginCard) authLoginCard.classList.add('d-none');
    if (authRegisterCard) authRegisterCard.classList.add('d-none');
  }
  toggleLogoutButtons(loggedIn);
};

const persistAuth = (next) => {
  authState = next;
  if (next) {
    localStorage.setItem('authState', JSON.stringify(next));
  } else {
    localStorage.removeItem('authState');
    authView = 'login';
  }
  refreshAuthUI();
};

const loadAuthFromStorage = () => {
  const saved = localStorage.getItem('authState');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      authState = parsed;
    } catch (e) {
      persistAuth(null);
    }
  }
  refreshAuthUI();
};

const apiRequest = async (path, options = {}, retry = true) => {
  const headers = options.headers || {};
  if (authState?.accessToken) {
    headers.Authorization = `Bearer ${authState.accessToken}`;
  }
  let bodyData = options.body;
  try {
    if (typeof options.body === 'string') {
      bodyData = JSON.parse(options.body);
    }
  } catch (e) {
    bodyData = options.body;
  }
  const logRequest = {
    path,
    method: options.method || 'GET',
    body: redactPayload(bodyData),
  };
  safeLog('request', logRequest);
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...headers },
    ...options,
  });
  if (response.status === 401 && retry && authState?.refreshToken) {
    try {
      const refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: authState.refreshToken }),
      });
      if (refreshRes.ok) {
        const refreshed = await refreshRes.json();
        persistAuth(refreshed);
        safeLog('auth', { action: 'refresh_ok' });
        return apiRequest(path, options, false);
      }
      safeLog('auth', { action: 'refresh_failed', status: refreshRes.status });
    } catch (error) {
      persistAuth(null);
      safeLog('auth', { action: 'refresh_error', error: error?.message });
    }
  }
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    const rawMessage =
      Array.isArray(error?.message) ? error.message.join('; ') : error?.message || error?.error || null;
    const fallback = `Eroare ${response.status}: ${response.statusText || 'A apărut o problemă'}`;
    safeLog('response', { path, status: response.status, error: rawMessage || fallback, payload: error });
    throw new Error(rawMessage || fallback);
  }
  safeLog('response', { path, status: response.status });
  if (response.status === 204) {
    return {};
  }
  return response.json().catch(() => ({}));
};

const renderEvents = (events) => {
  const safeEvents = Array.isArray(events) ? events : [];
  const eventsContainer = document.getElementById('eventsContainer');
  const registrationSelect = document.getElementById('registrationEvent');

  if (eventsContainer) {
    eventsContainer.innerHTML = '';
    if (!safeEvents.length) {
      eventsContainer.innerHTML =
        '<div class="panel">Nu există evenimente încă. Creează unul din pagina Organizatori.</div>';
    }
  }
  if (registrationSelect) {
    registrationSelect.innerHTML = '';
  }

  safeEvents.forEach((event) => {
    const card = document.createElement('div');
    card.className = 'card event-card h-100 glassy';
    const date = new Date(event.date);
    card.innerHTML = `
      <div class="card-body d-flex flex-column gap-2">
        <div class="d-flex justify-content-between align-items-start">
          <div>
            <p class="text-uppercase text-muted small mb-1">${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
            <h5 class="fw-semibold mb-1">${event.title}</h5>
          </div>
          <span class="status-pill">Bilet ${event.price ?? 0} RON</span>
        </div>
        <p class="text-muted flex-grow-1 mb-0">${event.description || 'Fără descriere.'}</p>
        <div class="event-meta">
          <span class="event-location">📍 ${event.location}</span>
          <span class="badge text-bg-dark">Locuri ${event.registrations_count ?? 0}/${event.max_quantity ?? '∞'}</span>
        </div>
      </div>
    `;
    if (eventsContainer) {
      eventsContainer.appendChild(card);
    }

    if (registrationSelect) {
      const option = document.createElement('option');
      option.value = event.id;
      option.textContent = `${event.title} — ${event.location}`;
      registrationSelect.appendChild(option);
    }
  });

  if (registrationSelect && !registrationSelect.options.length) {
    const option = document.createElement('option');
    option.textContent = 'Nu există evenimente disponibile';
    option.disabled = true;
    option.selected = true;
    registrationSelect.appendChild(option);
  }
};

const loadEvents = async () => {
  const hasTarget = document.getElementById('eventsContainer') || document.getElementById('registrationEvent');
  if (!hasTarget) return;
  try {
    const events = await apiRequest('/events', { method: 'GET' }, false);
    renderEvents(events);
  } catch (error) {
    renderEvents(mockEvents);
    showToast(`Nu am putut încărca evenimentele (${error.message}). Am afișat date demo.`, 'warning');
  }
};

const initLoginForm = () => {
  const loginForm = document.getElementById('loginForm');
  if (!loginForm) return;
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      const email = document.getElementById('loginEmail').value;
      const password = document.getElementById('loginPassword').value;
      const data = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      persistAuth(data);
      showToast('Autentificat cu succes');
    } catch (error) {
      showToast(error.message, 'danger');
    }
  });
};

const initRegisterForm = () => {
  const registerForm = document.getElementById('registerForm');
  if (!registerForm) return;
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      const name = document.getElementById('registerName').value;
      const email = document.getElementById('registerEmail').value;
      const password = document.getElementById('registerPassword').value;
      const role = document.getElementById('registerRole').value;
      await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password, role }),
      });
      showToast('Cont creat. Loghează-te cu datele introduse.');
      authView = 'login';
      if (loginEmailInput) loginEmailInput.value = email;
      registerForm.reset();
      refreshAuthUI();
    } catch (error) {
      showToast(error.message, 'danger');
    }
  });
};

const initLogoutButtons = () => {
  logoutButtons.forEach((btn) => {
    btn.addEventListener('click', async () => {
      try {
        await apiRequest('/auth/logout', {
          method: 'POST',
          body: JSON.stringify({ refreshToken: authState?.refreshToken }),
        });
      } catch (error) {
      }
      persistAuth(null);
      showToast('Ai ieșit din cont');
    });
  });
};

const initRegistrationForm = () => {
  const registrationForm = document.getElementById('registrationForm');
  const registrationSelect = document.getElementById('registrationEvent');
  if (!registrationForm) return;
  registrationForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!authState?.accessToken) {
      showToast('Trebuie să fii logat pentru înscriere', 'warning');
      return;
    }
    try {
      const eventId = Number(registrationSelect.value);
      await apiRequest('/registrations', {
        method: 'POST',
        body: JSON.stringify({ eventId }),
      });
      showToast('Te-ai înscris la eveniment!');
      loadEvents();
    } catch (error) {
      showToast(error.message, 'danger');
    }
  });
};

const initCreateEventForm = () => {
  const createEventForm = document.getElementById('createEventForm');
  if (!createEventForm) return;
  createEventForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!authState?.accessToken) {
      showToast('Trebuie să fii organizator sau admin pentru a crea evenimente', 'warning');
      return;
    }
    if (!['organizer', 'admin'].includes(authState.user?.role)) {
      showToast('Rol insuficient pentru a crea evenimente', 'danger');
      return;
    }
    const title = document.getElementById('eventName')?.value;
    const description = document.getElementById('eventDescription')?.value;
    const location = document.getElementById('eventLocation')?.value;
    const date = document.getElementById('eventDate')?.value;
    const price = Number(document.getElementById('eventPrice')?.value);
    const maxQuantity = Number(document.getElementById('eventTickets')?.value);
    const category = document.getElementById('eventCategory')?.value;
    const payload = {
      title,
      description,
      location,
      date,
      category,
      ticket: {
        price,
        max_quantity: maxQuantity,
      },
    };
    try {
      await apiRequest('/events', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      showToast('Eveniment creat');
      e.target.reset();
      loadEvents();
    } catch (error) {
      showToast(error.message, 'danger');
    }
  });
};

const initRefreshButton = () => {
  const refreshEventsBtn = document.getElementById('refreshEventsBtn');
  if (!refreshEventsBtn) return;
  refreshEventsBtn.addEventListener('click', loadEvents);
};

const initAuthToggles = () => {
  if (showRegisterBtn) {
    showRegisterBtn.addEventListener('click', () => {
      authView = 'register';
      refreshAuthUI();
    });
  }
  if (showLoginBtn) {
    showLoginBtn.addEventListener('click', () => {
      authView = 'login';
      refreshAuthUI();
    });
  }
};

const highlightActiveNav = () => {
  const currentPage = document.body.dataset.page;
  document.querySelectorAll('[data-nav]').forEach((link) => {
    if (link.dataset.nav === currentPage) {
      link.classList.add('active', 'nav-highlight');
    } else {
      link.classList.remove('active', 'nav-highlight');
    }
  });
};

document.addEventListener('DOMContentLoaded', () => {
  loadAuthFromStorage();
  highlightActiveNav();
  initAuthToggles();
  initLogoutButtons();
  initLoginForm();
  initRegisterForm();
  initRegistrationForm();
  initCreateEventForm();
  initRefreshButton();
  loadEvents();
});
