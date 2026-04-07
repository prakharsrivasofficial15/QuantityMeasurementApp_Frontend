/**
 * ============================================================
 *  QUANTITY MEASUREMENT APP — script.js
 *
 *  Modules (all under the App namespace):
 *    App.Auth      — Modal open/close, Login, Signup, tab switching
 *    App.Session   — sessionStorage read/write, logout
 *    App.UnitData  — Unit categories, conversion logic (Class)
 *    App.Converter — UI: populate dropdowns, run conversion (async/AJAX), swap units
 *    App.History   — localStorage history per user (login-gated)
 *    App.UI        — Shared helpers: toast, msg, loader
 *    App.init      — Bootstrap on DOMContentLoaded
 *
 *  JS Topics covered:
 *    Classes, Objects, Exception handling, ES9+ features,
 *    Async/Await, Callbacks, Promises, AJAX simulation,
 *    DOM manipulation, Event handling, Conditional logic,
 *    Dynamic UI rendering, localStorage, sessionStorage
 * ============================================================
 */

'use strict';

/* ============================================================
   NAMESPACE ROOT
   ============================================================ */
/* Main application namespace object */
const App = {};


/* ============================================================
   App.UnitData  —  Data Layer & Conversion Engine (Class)
   ============================================================ */
/* Class containing unit data and conversion methods */
App.UnitData = class UnitData {

  /**
   * All unit categories with their units and base-conversion factors.
   * Temperature is special — handled separately via convertTemp().
   */
  static categories = {
    length: {
      label: 'Length',
      units: [
        { key: 'mm',  label: 'Millimetre (mm)',    toBase: 0.001,    info: '1 mm = 0.001 m' },
        { key: 'cm',  label: 'Centimetre (cm)',    toBase: 0.01,     info: '1 cm = 0.01 m' },
        { key: 'm',   label: 'Metre (m)',           toBase: 1,        info: 'SI base unit' },
        { key: 'km',  label: 'Kilometre (km)',      toBase: 1000,     info: '1 km = 1000 m' },
        { key: 'in',  label: 'Inch (in)',           toBase: 0.0254,   info: '1 in = 2.54 cm' },
        { key: 'ft',  label: 'Foot (ft)',           toBase: 0.3048,   info: '1 ft = 12 in' },
        { key: 'yd',  label: 'Yard (yd)',           toBase: 0.9144,   info: '1 yd = 3 ft' },
        { key: 'mi',  label: 'Mile (mi)',           toBase: 1609.344, info: '1 mi = 5280 ft' },
      ]
    },
    weight: {
      label: 'Weight / Mass',
      units: [
        { key: 'mg',  label: 'Milligram (mg)',      toBase: 0.000001, info: '1 mg = 0.001 g' },
        { key: 'g',   label: 'Gram (g)',             toBase: 0.001,    info: '1 g = 0.001 kg' },
        { key: 'kg',  label: 'Kilogram (kg)',        toBase: 1,        info: 'SI base unit' },
        { key: 't',   label: 'Tonne (t)',            toBase: 1000,     info: '1 t = 1000 kg' },
        { key: 'oz',  label: 'Ounce (oz)',           toBase: 0.028349, info: '1 oz = 28.35 g' },
        { key: 'lb',  label: 'Pound (lb)',           toBase: 0.453592, info: '1 lb = 16 oz' },
      ]
    },
    volume: {
      label: 'Volume',
      units: [
        { key: 'ml',  label: 'Millilitre (ml)',     toBase: 0.001,    info: '1 ml = 0.001 L' },
        { key: 'l',   label: 'Litre (L)',            toBase: 1,        info: 'Base unit here' },
        { key: 'm3',  label: 'Cubic Metre (m³)',    toBase: 1000,     info: '1 m³ = 1000 L' },
        { key: 'gal', label: 'Gallon (US)',          toBase: 3.78541,  info: '1 gal = 3.785 L' },
        { key: 'fl',  label: 'Fluid Oz (fl oz)',    toBase: 0.029574, info: '1 fl oz = 29.57 ml' },
        { key: 'cup', label: 'Cup (US)',             toBase: 0.236588, info: '1 cup = 236.6 ml' },
      ]
    },
    temperature: {
      label: 'Temperature',
      units: [
        { key: 'c', label: 'Celsius (°C)',          toBase: null, info: 'Water freezes at 0°C' },
        { key: 'f', label: 'Fahrenheit (°F)',       toBase: null, info: 'Water freezes at 32°F' },
        { key: 'k', label: 'Kelvin (K)',             toBase: null, info: 'Absolute zero = 0 K' },
      ]
    },
    area: {
      label: 'Area',
      units: [
        { key: 'mm2', label: 'Sq Millimetre',       toBase: 0.000001, info: '1 mm² = 10⁻⁶ m²' },
        { key: 'cm2', label: 'Sq Centimetre',       toBase: 0.0001,   info: '1 cm² = 10⁻⁴ m²' },
        { key: 'm2',  label: 'Sq Metre (m²)',       toBase: 1,        info: 'SI base unit' },
        { key: 'km2', label: 'Sq Kilometre (km²)',  toBase: 1e6,      info: '1 km² = 10⁶ m²' },
        { key: 'ac',  label: 'Acre',                 toBase: 4046.86,  info: '1 acre ≈ 4047 m²' },
        { key: 'ha',  label: 'Hectare (ha)',         toBase: 10000,    info: '1 ha = 10000 m²' },
      ]
    },
    speed: {
      label: 'Speed',
      units: [
        { key: 'mps',  label: 'm/s',               toBase: 1,        info: 'SI base unit' },
        { key: 'kph',  label: 'km/h',              toBase: 1 / 3.6,  info: '1 km/h = 0.278 m/s' },
        { key: 'mph',  label: 'Miles/h',           toBase: 0.44704,  info: '1 mph = 0.447 m/s' },
        { key: 'knot', label: 'Knot',              toBase: 0.514444, info: '1 kn = 0.514 m/s' },
      ]
    }
  };

  /**
   * Temperature conversion (special case — no linear base factor).
   * @param {number} val
   * @param {string} from  'c' | 'f' | 'k'
   * @param {string} to    'c' | 'f' | 'k'
   * @returns {number}
   */
  static convertTemp(val, from, to) {
    let celsius;
    switch (from) {
      case 'c': celsius = val; break;
      case 'f': celsius = (val - 32) * 5 / 9; break;
      case 'k': celsius = val - 273.15; break;
      default:  throw new Error(`Unknown temperature unit: ${from}`);
    }
    switch (to) {
      case 'c': return celsius;
      case 'f': return celsius * 9 / 5 + 32;
      case 'k': return celsius + 273.15;
      default:  throw new Error(`Unknown temperature unit: ${to}`);
    }
  }

  /**
   * Universal conversion via base factor.
   * @param {number} val
   * @param {string} from  unit key
   * @param {string} to    unit key
   * @param {string} cat   category key
   * @returns {number}
   */
  static convert(val, from, to, cat) {
    if (cat === 'temperature') return App.UnitData.convertTemp(val, from, to);
    const units = App.UnitData.categories[cat].units;
    const fUnit = units.find(u => u.key === from);
    const tUnit = units.find(u => u.key === to);
    if (!fUnit || !tUnit) throw new Error('Unknown unit key provided.');
    return (val * fUnit.toBase) / tUnit.toBase;
  }
};


/* ============================================================
   App.Session  —  sessionStorage + user state
   ============================================================ */
/* IIFE module for managing user session data */
App.Session = (() => {
  const SESSION_KEY = 'qm_user';
  let _currentUser  = null;

  /** Load user from sessionStorage on page load. */
  function load() {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (raw) _currentUser = JSON.parse(raw);
    } catch (e) {
      _currentUser = null;
    }
  }

  /** Save user to sessionStorage after login. */
  function save(user) {
    _currentUser = user;
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
  }

  /** Clear session and update UI. */
  function logout() {
    sessionStorage.removeItem(SESSION_KEY);
    _currentUser = null;
    App.UI.updateNav();
    App.History.render();
    App.UI.toast('Logged out successfully.');
  }

  /** Accessor for current user object (or null). */
  function current() { return _currentUser; }

  /** True if user is logged in. */
  function isLoggedIn() { return _currentUser !== null; }

  return { load, save, logout, current, isLoggedIn };
})();


/* ============================================================
   App.Auth  —  Modal-based Login, Signup, tab switching
   ============================================================ */
/* IIFE module for authentication functionality */
  /* Load user array from localStorage. */
  function _getUsers() {
    try { return JSON.parse(localStorage.getItem(USERS_KEY) || '[]'); }
    catch (e) { return []; }
  }

  /* Persist user array to localStorage. */
  function _saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  /** Open the auth modal, optionally selecting a tab. */
  function openModal(tab = 'login') {
    // Clear any previous messages
    ['msg-login', 'msg-signup'].forEach(id => {
      const el = document.getElementById(id);
      if (el) { el.textContent = ''; el.className = 'form-msg'; }
    });
    switchTab(tab);
    document.getElementById('auth-modal').classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  /** Close the auth modal. */
  function closeModal() {
    document.getElementById('auth-modal').classList.remove('open');
    document.body.style.overflow = '';
  }

  /** Switch between 'login' and 'signup' tabs. */
  function switchTab(tab) {
    ['login', 'signup'].forEach(id => {
      document.getElementById('tab-'   + id).classList.toggle('active', id === tab);
      document.getElementById('panel-' + id).classList.toggle('active', id === tab);
    });
  }

  /** Toggle password field visibility. */
  function togglePw(inputId, btn) {
    const inp = document.getElementById(inputId);
    inp.type = (inp.type === 'password') ? 'text' : 'password';
    btn.style.color = (inp.type === 'text') ? 'var(--coral)' : 'var(--text-3)';
  }

  /** Handle Signup form submission with full validation. */
  function handleSignup() {
    const fname  = document.getElementById('su-fname').value.trim();
    const lname  = document.getElementById('su-lname').value.trim();
    const email  = document.getElementById('su-email').value.trim();
    const pw     = document.getElementById('su-pw').value;
    const mobile = document.getElementById('su-mobile').value.trim();

    try {
      if (!fname || !lname)
        throw new Error('Please enter your first and last name.');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
        throw new Error('Enter a valid email address.');
      if (pw.length < 6)
        throw new Error('Password must be at least 6 characters.');
      if (!/^\d{10}$/.test(mobile))
        throw new Error('Enter a valid 10-digit mobile number.');

      const users = _getUsers();
      if (users.find(u => u.email === email))
        throw new Error('Email already registered — sign in instead.');

      const newUser = { name: `${fname} ${lname}`, email, pw, mobile };
      users.push(newUser);
      _saveUsers(users);

      App.UI.setMsg('msg-signup', '✓ Account created! Switching to sign in…', 'ok');
      setTimeout(() => switchTab('login'), 1100);

    } catch (e) {
      App.UI.setMsg('msg-signup', e.message, 'err');
    }
  }

  /** Handle Login form submission. */
  function handleLogin() {
    const email = document.getElementById('li-email').value.trim();
    const pw    = document.getElementById('li-pw').value;

    try {
      if (!email) throw new Error('Email is required.');
      if (!pw)    throw new Error('Password is required.');

      const users = _getUsers();
      const user  = users.find(u => u.email === email && u.pw === pw);
      if (!user)  throw new Error('Incorrect email or password.');

      App.Session.save(user);
      App.UI.setMsg('msg-login', `✓ Welcome back, ${user.name.split(' ')[0]}!`, 'ok');

      // Close modal after brief delay, update nav + history
      setTimeout(() => {
        closeModal();
        App.UI.updateNav();
        App.History.render();
        App.UI.toast(`Welcome back, ${user.name.split(' ')[0]}! 👋`);
      }, 700);

    } catch (e) {
      App.UI.setMsg('msg-login', e.message, 'err');
    }
  }

  return { openModal, closeModal, switchTab, togglePw, handleSignup, handleLogin };
})();


/* ============================================================
   App.Converter  —  Async unit conversion with AJAX simulation
   ============================================================ */
/* IIFE module for handling unit conversion UI and logic */
App.Converter = (() => {

  /**
   * AJAX simulation using Promise + setTimeout (Async/Callback/Promise).
   * Mimics a network round-trip with 350ms latency.
   * @returns {Promise<number>}
   */
  function _fakeAjax(val, from, to, cat) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          resolve(App.UnitData.convert(val, from, to, cat));
        } catch (err) {
          reject(err);
        }
      }, 350);
    });
  }

  /** Populate From and To dropdowns for a given category. */
  function populateUnits(cat) {
    const units = App.UnitData.categories[cat].units;
    ['from-unit', 'to-unit'].forEach((id, idx) => {
      const sel = document.getElementById(id);
      sel.innerHTML = '';
      units.forEach((u, i) => {
        const opt = document.createElement('option');
        opt.value       = u.key;
        opt.textContent = u.label;
        if (idx === 1 && i === 1) opt.selected = true; // default "to" = second unit
        sel.appendChild(opt);
      });
    });
  }

  /** Render unit chips in the info panel. */
  function renderUnitInfo(cat) {
    const units = App.UnitData.categories[cat].units;
    document.getElementById('cat-label').textContent = App.UnitData.categories[cat].label;
    document.getElementById('unit-info-grid').innerHTML = units.map(u => `
      <div class="unit-chip">
        <strong>${u.label}</strong>
        <span>${u.info}</span>
      </div>
    `).join('');
  }

  /** Called when category dropdown changes. */
  function onCategoryChange() {
    const cat = document.getElementById('category').value;
    populateUnits(cat);
    renderUnitInfo(cat);
    const rb = document.getElementById('result-box');
    rb.className  = 'result-box empty';
    rb.textContent = 'Result will appear here';
  }

  /** Swap From and To unit selections. */
  function swapUnits() {
    const from = document.getElementById('from-unit');
    const to   = document.getElementById('to-unit');
    const temp = from.value;
    from.value = to.value;
    to.value   = temp;
    // If there's a result, re-convert automatically
    const val = document.getElementById('input-val').value;
    if (val !== '') convert();
  }

  /**
   * Main async conversion handler.
   * Uses async/await over the fakeAjax Promise.
   */
  async function convert() {
    const valStr = document.getElementById('input-val').value;
    const from   = document.getElementById('from-unit').value;
    const to     = document.getElementById('to-unit').value;
    const cat    = document.getElementById('category').value;
    const rb     = document.getElementById('result-box');

    // Input validation
    if (valStr === '' || isNaN(parseFloat(valStr))) {
      rb.className  = 'result-box empty';
      rb.textContent = '⚠️ Please enter a valid number.';
      return;
    }

    const val = parseFloat(valStr);

    // Show async loading state
    rb.className  = 'result-box';
    rb.innerHTML  = '<span class="loader"></span> Converting…';

    try {
      // Await the Promise (AJAX simulation)
      const result    = await _fakeAjax(val, from, to, cat);
      const fromLabel = document.getElementById('from-unit').selectedOptions[0].textContent;
      const toLabel   = document.getElementById('to-unit').selectedOptions[0].textContent;
      const formatted = +result.toFixed(8); // strip trailing zeros

      rb.textContent = `${val} ${fromLabel} = ${formatted} ${toLabel}`;

      // Save to history ONLY for logged-in users
      if (App.Session.isLoggedIn()) {
        App.History.save({
          from: `${val} ${fromLabel}`,
          to:   `${formatted} ${toLabel}`,
          cat:  App.UnitData.categories[cat].label,
          ts:   new Date().toLocaleString()
        });
        App.History.render();
      }

    } catch (err) {
      rb.className  = 'result-box empty';
      rb.textContent = '❌ ' + err.message;
    }
  }

  return { onCategoryChange, swapUnits, convert };
})();


/* ============================================================
   App.History  —  localStorage history (login-gated)
   ============================================================ */
/* IIFE module for managing conversion history */
App.History = (() => {
  const MAX_ENTRIES = 50;

  function _key() {
    const user = App.Session.current();
    return user ? `qm_history_${user.email}` : null;
  }

  function _get() {
    const k = _key();
    if (!k) return [];
    try { return JSON.parse(localStorage.getItem(k) || '[]'); }
    catch (e) { return []; }
  }

  /** Save a new history entry to localStorage. */
  function save(entry) {
    const k = _key();
    if (!k) return;
    const hist = _get();
    hist.unshift(entry);
    if (hist.length > MAX_ENTRIES) hist.pop();
    localStorage.setItem(k, JSON.stringify(hist));
  }

  /** Clear all history entries for current user. */
  function clear() {
    const k = _key();
    if (!k) return;
    localStorage.removeItem(k);
    render();
    App.UI.toast('History cleared.');
  }

  /** Dynamically render the history list (or locked state). */
  function render() {
    const container = document.getElementById('history-container');
    const btnClear  = document.getElementById('btn-clear');

    if (!App.Session.isLoggedIn()) {
      btnClear.style.display = 'none';
      container.innerHTML = `
        <div class="history-locked">
          <div class="lock-icon-wrap">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <rect x="3" y="11" width="18" height="11" rx="2"/>
              <path d="M7 11V7a5 5 0 0110 0v4"/>
            </svg>
          </div>
          <p>Your conversion history is saved per account.<br/>Sign in or create a free account to track your conversions.</p>
          <button class="btn-login-history" onclick="App.Auth.openModal('login')">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            Sign In to See History
          </button>
        </div>`;
      return;
    }

    const hist = _get();
    btnClear.style.display = hist.length ? 'inline-block' : 'none';

    if (!hist.length) {
      container.innerHTML = '<p class="history-empty">No conversions yet. Start converting above!</p>';
      return;
    }

    container.innerHTML = `
      <ul class="history-list">
        ${hist.map(h => `
          <li class="history-item">
            <div>
              <span class="cat-badge">${h.cat}</span>
              <div class="from-to">${h.from} → ${h.to}</div>
            </div>
            <div class="ts">${h.ts}</div>
          </li>
        `).join('')}
      </ul>`;
  }

  return { save, clear, render };
})();

/* ============================================================
   App.UI  —  Shared UI helpers
   ============================================================ */
/* IIFE module for shared UI utility functions */
App.UI = (() => {
  let _toastTimer = null;

  /** Show/hide a toast notification. */
  function toast(message) {
    const el = document.getElementById('toast');
    el.textContent = message;
    el.classList.add('show');
    clearTimeout(_toastTimer);
    _toastTimer = setTimeout(() => el.classList.remove('show'), 2600);
  }

  /** Set a form message element with text and type ('ok' | 'err'). */
  function setMsg(id, text, type) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = text;
    el.className   = `form-msg ${type}`;
  }

  /** Update navbar user info and login/logout button visibility. */
  function updateNav() {
    const user       = App.Session.current();
    const userInfo   = document.getElementById('nav-user-info');
    const avatarEl   = document.getElementById('nav-avatar');
    const nameEl     = document.getElementById('nav-username');
    const loginBtn   = document.getElementById('btn-login-nav');
    const logoutBtn  = document.getElementById('btn-logout-nav');

    if (user) {
      // Derive initials for avatar
      const parts    = user.name.trim().split(' ');
      const initials = (parts[0][0] + (parts[1] ? parts[1][0] : '')).toUpperCase();
      avatarEl.textContent   = initials;
      nameEl.textContent     = user.name.split(' ')[0];
      userInfo.style.display = 'flex';
      loginBtn.style.display  = 'none';
      logoutBtn.style.display = 'inline-flex';
    } else {
      userInfo.style.display  = 'none';
      loginBtn.style.display  = 'inline-flex';
      logoutBtn.style.display = 'none';
    }
  }

  return { toast, setMsg, updateNav };
})();


/* ============================================================
   App.init  —  Bootstrap everything on DOM ready
   ============================================================ */
/* Initialization function called on DOMContentLoaded */
App.init = function () {

  // 1. Restore session from sessionStorage
  App.Session.load();

  // 2. Initialize converter UI (always visible — no login needed)
  App.Converter.onCategoryChange();

  // 3. Update navbar based on session state
  App.UI.updateNav();

  // 4. Render history (shows locked state or list depending on login)
  App.History.render();

  // 5. Close modal on overlay click (click outside modal-card)
  document.getElementById('auth-modal').addEventListener('click', function (e) {
    if (e.target === this) App.Auth.closeModal();
  });

  // 6. Close modal on Escape key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') App.Auth.closeModal();

    // Enter on value input triggers convert
    if (e.key === 'Enter' && document.activeElement.id === 'input-val') {
      App.Converter.convert();
    }

    // Enter in auth modal forms
    if (e.key === 'Enter' && document.getElementById('auth-modal').classList.contains('open')) {
      const loginActive  = document.getElementById('panel-login')?.classList.contains('active');
      const signupActive = document.getElementById('panel-signup')?.classList.contains('active');
      if (loginActive)  App.Auth.handleLogin();
      if (signupActive) App.Auth.handleSignup();
    }
  });
};

// Run on DOM ready
/* Event listener to initialize the app when DOM is ready */
document.addEventListener('DOMContentLoaded', App.init);