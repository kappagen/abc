import { Toast } from '../../utilities/toast.js';

const PHYSIO_STORAGE_KEY = 'irhlms-physio-v2';
const WEEK_DAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
const JS_DAY_TO_KEY = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
const DAY_LABELS = {
  mon: 'Mon',
  tue: 'Tue',
  wed: 'Wed',
  thu: 'Thu',
  fri: 'Fri',
  sat: 'Sat',
  sun: 'Sun'
};

export class PhysioPage {
  static _bound = false;
  static _pickerBound = false;
  static _store = null;
  static _weeklyChart = null;
  static _timeState = { hour: '07', minute: '00', meridiem: 'AM' };

  static _emptyWeeklyLog() {
    return { mon: 0, tue: 0, wed: 0, thu: 0, fri: 0, sat: 0, sun: 0 };
  }

  static _defaultPhysioState() {
    return {
      exercises: [
        {
          id: 'ex-1',
          name: 'Leg Strengthening',
          time: '08:00 AM',
          details: '3 x 12 reps | Resistance band',
          done: true
        },
        {
          id: 'ex-2',
          name: 'Core Stability Circuit',
          time: '12:30 PM',
          details: 'Plank 30s x 3 | Bridge 15 x 3',
          done: true
        },
        {
          id: 'ex-3',
          name: 'Upper Body Stretch',
          time: '06:00 PM',
          details: '20 min flexibility routine',
          done: false
        }
      ],
      weeklyLog: {
        mon: 2,
        tue: 2,
        wed: 1,
        thu: 3,
        fri: 2,
        sat: 3,
        sun: 1
      },
      weekHistory: [11, 13, 12],
      activeWeek: this._getWeekKey(new Date())
    };
  }

  static init(store) {
    this._store = store;
    this._ensurePhysioState(store);
    this._renderExercises();
    this._renderWeeklyVisuals();
    this._renderStats();
    this._initTimePicker();

    if (this._bound) return;

    const list = document.getElementById('ex-list');

    list?.addEventListener('click', (event) => {
      if (event.target.closest('.ex-complete-check')) return;
      const item = event.target.closest('.ex-item[data-ex-id]');
      if (!item) return;
      this._toggleExercise(item.dataset.exId);
    });

    list?.addEventListener('change', (event) => {
      const checkbox = event.target.closest('.ex-complete-check[data-ex-toggle]');
      if (!checkbox) return;
      this._toggleExercise(checkbox.dataset.exToggle, checkbox.checked);
    });

    list?.addEventListener('keydown', (event) => {
      if (event.target.closest('.ex-complete-check')) return;
      const item = event.target.closest('.ex-item[data-ex-id]');
      if (!item) return;
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      this._toggleExercise(item.dataset.exId);
    });

    document.getElementById('add-ex-btn')?.addEventListener('click', () => {
      this._addExercise();
    });

    ['ex-name-inp', 'ex-time-inp', 'ex-desc-inp'].forEach((id) => {
      document.getElementById(id)?.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter') return;
        if (id === 'ex-desc-inp' && event.shiftKey) return;
        event.preventDefault();
        this._addExercise();
      });
    });

    this._bound = true;
  }

  static _normalizeWeeklyLog(rawLog) {
    const fallback = this._emptyWeeklyLog();

    if (Array.isArray(rawLog)) {
      return WEEK_DAY_KEYS.reduce((acc, key, index) => {
        const n = Number(rawLog[index]);
        acc[key] = Number.isFinite(n) && n >= 0 ? n : 0;
        return acc;
      }, { ...fallback });
    }

    if (!rawLog || typeof rawLog !== 'object') {
      return fallback;
    }

    return WEEK_DAY_KEYS.reduce((acc, key) => {
      const n = Number(rawLog[key]);
      acc[key] = Number.isFinite(n) && n >= 0 ? n : 0;
      return acc;
    }, { ...fallback });
  }

  static _normalizeState(rawState = {}) {
    const fallback = this._defaultPhysioState();

    const exercises = Array.isArray(rawState.exercises)
      ? rawState.exercises
          .map((exercise, index) => {
            const name = String(exercise?.name || '').trim();
            if (!name) return null;
            return {
              id: String(exercise?.id || `ex-${index + 1}`),
              name,
              time: String(exercise?.time || '').trim(),
              details: String(exercise?.details || '').trim(),
              done: Boolean(exercise?.done)
            };
          })
          .filter(Boolean)
      : fallback.exercises;

    const weekHistory = Array.isArray(rawState.weekHistory)
      ? rawState.weekHistory
          .map((value) => Number(value))
          .filter((value) => Number.isFinite(value) && value >= 0)
          .slice(-12)
      : fallback.weekHistory;

    const activeWeek =
      typeof rawState.activeWeek === 'string' && rawState.activeWeek.trim()
        ? rawState.activeWeek
        : this._getWeekKey(new Date());

    return {
      exercises,
      weeklyLog: this._normalizeWeeklyLog(rawState.weeklyLog),
      weekHistory,
      activeWeek
    };
  }

  static _readLocalState() {
    try {
      const raw = localStorage.getItem(PHYSIO_STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  static _persistState(state) {
    try {
      localStorage.setItem(PHYSIO_STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore quota/storage errors for now.
    }
  }

  static _getWeekKey(date) {
    const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNumber = utcDate.getUTCDay() || 7;
    utcDate.setUTCDate(utcDate.getUTCDate() + 4 - dayNumber);
    const yearStart = new Date(Date.UTC(utcDate.getUTCFullYear(), 0, 1));
    const weekNumber = Math.ceil((((utcDate - yearStart) / 86400000) + 1) / 7);
    return `${utcDate.getUTCFullYear()}-W${String(weekNumber).padStart(2, '0')}`;
  }

  static _rollWeekIfNeeded(state) {
    const currentWeek = this._getWeekKey(new Date());
    if (state.activeWeek === currentWeek) return state;

    const previousWeekTotal = this._sumWeeklyLog(state.weeklyLog);
    const nextHistory = [...state.weekHistory, previousWeekTotal].slice(-12);

    return {
      ...state,
      activeWeek: currentWeek,
      weekHistory: nextHistory,
      weeklyLog: this._emptyWeeklyLog(),
      exercises: state.exercises.map((exercise) => ({ ...exercise, done: false }))
    };
  }

  static _ensurePhysioState(store) {
    const persisted = this._readLocalState();
    const storeState = store.get('physio');
    const baseState = persisted || storeState || this._defaultPhysioState();
    const normalized = this._rollWeekIfNeeded(this._normalizeState(baseState));

    store.set('physio', normalized);
    this._persistState(normalized);
    return normalized;
  }

  static _getState() {
    if (!this._store) return this._defaultPhysioState();

    const normalized = this._normalizeState(this._store.get('physio') || {});
    const rolled = this._rollWeekIfNeeded(normalized);

    if (rolled !== normalized) {
      this._store.set('physio', rolled);
      this._persistState(rolled);
      return rolled;
    }

    return normalized;
  }

  static _sumWeeklyLog(weeklyLog) {
    return WEEK_DAY_KEYS.reduce((sum, key) => sum + (Number(weeklyLog[key]) || 0), 0);
  }

  static _todayKey() {
    return JS_DAY_TO_KEY[new Date().getDay()] || 'mon';
  }

  static _exerciseCompletionRate(state) {
    const totalExercises = state.exercises.length;
    if (!totalExercises) return 0;
    const completed = state.exercises.filter((exercise) => exercise.done).length;
    return Math.round((completed / totalExercises) * 100);
  }

  static _monthlyAverage(state) {
    const samples = [...state.weekHistory.slice(-3), this._sumWeeklyLog(state.weeklyLog)];
    if (!samples.length) return '0.0';
    const avg = samples.reduce((acc, value) => acc + value, 0) / samples.length;
    return avg.toFixed(1);
  }

  static _renderExercises() {
    const host = document.getElementById('ex-list');
    if (!host) return;

    const state = this._getState();
    host.innerHTML = '';

    if (!state.exercises.length) {
      const empty = document.createElement('div');
      empty.style.fontSize = '13px';
      empty.style.color = 'var(--txt3)';
      empty.style.padding = '8px 2px';
      empty.textContent = 'No exercises in plan yet. Add one below.';
      host.appendChild(empty);
      return;
    }

    state.exercises.forEach((exercise) => {
      const item = document.createElement('div');
      item.className = `ex-item${exercise.done ? ' done' : ''}`;
      item.dataset.exId = exercise.id;
      item.tabIndex = 0;

      const row = document.createElement('div');
      row.style.display = 'flex';
      row.style.alignItems = 'center';
      row.style.gap = '12px';

      const check = document.createElement('div');
      check.className = 'ex-check has-input';

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'ex-complete-check';
      checkbox.dataset.exToggle = exercise.id;
      checkbox.setAttribute('aria-label', `Mark ${exercise.name} as completed`);
      checkbox.checked = exercise.done;
      check.appendChild(checkbox);

      const copy = document.createElement('div');

      const title = document.createElement('div');
      title.className = 'ex-name';
      title.textContent = exercise.name;

      const meta = document.createElement('div');
      meta.className = 'ex-meta';
      meta.textContent = `${exercise.time || '-'} | ${exercise.details || '-'}`;

      copy.append(title, meta);
      row.append(check, copy);
      item.appendChild(row);

      this._syncExerciseItem(item, exercise.done, exercise.name);
      host.appendChild(item);
    });
  }

  static _syncExerciseItem(item, isDone, exerciseName) {
    item.classList.toggle('done', isDone);
    item.setAttribute('role', 'checkbox');
    item.setAttribute('aria-checked', isDone ? 'true' : 'false');
    item.setAttribute('aria-label', `${exerciseName}. ${isDone ? 'Completed' : 'Pending'}.`);
  }

  static _toggleExercise(exerciseId, forcedDone = null) {
    if (!this._store || !exerciseId) return;

    this._store.update('physio', (rawState) => {
      const state = this._rollWeekIfNeeded(this._normalizeState(rawState));
      const weeklyLog = { ...state.weeklyLog };
      const todayKey = this._todayKey();

      let changed = false;
      let oldDone = false;
      let newDone = false;

      const exercises = state.exercises.map((exercise) => {
        if (exercise.id !== exerciseId) return exercise;

        changed = true;
        oldDone = exercise.done;
        newDone = forcedDone === null ? !exercise.done : Boolean(forcedDone);
        return { ...exercise, done: newDone };
      });

      if (!changed || oldDone === newDone) {
        return state;
      }

      if (!oldDone && newDone) {
        weeklyLog[todayKey] = (weeklyLog[todayKey] || 0) + 1;
      } else if (oldDone && !newDone) {
        weeklyLog[todayKey] = Math.max(0, (weeklyLog[todayKey] || 0) - 1);
      }

      return {
        ...state,
        exercises,
        weeklyLog
      };
    });

    const nextState = this._getState();
    this._persistState(nextState);
    this._renderExercises();
    this._renderWeeklyVisuals();
    this._renderStats();
  }

  static _renderWeeklyVisuals() {
    const state = this._getState();
    const totalExercises = Math.max(state.exercises.length, 1);

    WEEK_DAY_KEYS.forEach((dayKey) => {
      const count = Number(state.weeklyLog[dayKey]) || 0;
      const percent = Math.min(100, Math.round((count / totalExercises) * 100));

      const bar = document.querySelector(`.day-progress[data-day="${dayKey}"]`);
      if (bar) {
        bar.style.width = `${percent}%`;
        bar.setAttribute('aria-label', `${DAY_LABELS[dayKey]} ${count} completed`);
      }

      const value = document.querySelector(`[data-day-value="${dayKey}"]`);
      if (value) {
        value.textContent = String(count);
      }
    });

    this._renderWeeklyChart(state);
  }

  static _renderWeeklyChart(state) {
    const canvas = document.getElementById('ex-weekly-chart');
    if (!canvas) return;
    if (!window.Chart) return;

    const data = WEEK_DAY_KEYS.map((dayKey) => Number(state.weeklyLog[dayKey]) || 0);
    const labels = WEEK_DAY_KEYS.map((dayKey) => DAY_LABELS[dayKey]);

    const rootStyles = getComputedStyle(document.documentElement);
    const barColor = rootStyles.getPropertyValue('--emerald').trim() || '#34a853';
    const borderColor = rootStyles.getPropertyValue('--emerald').trim() || '#34a853';

    if (this._weeklyChart) {
      this._weeklyChart.data.labels = labels;
      this._weeklyChart.data.datasets[0].data = data;
      this._weeklyChart.update();
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    this._weeklyChart = new window.Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            data,
            backgroundColor: `${barColor}CC`,
            borderColor,
            borderWidth: 1,
            borderRadius: 6,
            maxBarThickness: 28
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => `Completed: ${context.raw}`
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              precision: 0,
              stepSize: 1
            },
            grid: {
              color: 'rgba(142, 153, 165, 0.18)'
            }
          },
          x: {
            grid: {
              display: false
            }
          }
        }
      }
    });
  }

  static _renderStats() {
    const state = this._getState();

    const total = state.exercises.length;
    const completed = state.exercises.filter((exercise) => exercise.done).length;
    const pending = Math.max(total - completed, 0);

    const summary = document.getElementById('physio-summary-text');
    if (summary) {
      summary.textContent = `Today's exercise plan | ${total} sessions scheduled`;
    }

    const completedEl = document.getElementById('physio-meta-completed');
    const pendingEl = document.getElementById('physio-meta-pending');
    const totalEl = document.getElementById('physio-meta-total');
    if (completedEl) completedEl.textContent = String(completed);
    if (pendingEl) pendingEl.textContent = String(pending);
    if (totalEl) totalEl.textContent = String(total);

    const weekTotal = this._sumWeeklyLog(state.weeklyLog);
    const monthAvg = this._monthlyAverage(state);
    const completionRate = this._exerciseCompletionRate(state);

    const weekEl = document.getElementById('ex-stat-week');
    const monthEl = document.getElementById('ex-stat-month');
    const rateEl = document.getElementById('ex-stat-rate');

    if (weekEl) weekEl.textContent = String(weekTotal);
    if (monthEl) monthEl.textContent = monthAvg;
    if (rateEl) rateEl.textContent = `${completionRate}%`;
  }

  static _addExercise() {
    if (!this._store) return;

    const nameInput = document.getElementById('ex-name-inp');
    const timeInput = document.getElementById('ex-time-inp');
    const descInput = document.getElementById('ex-desc-inp');

    const name = nameInput?.value.trim() || '';
    const rawTime = timeInput?.value.trim() || '';
    const details = descInput?.value.trim() || '';

    if (!name) {
      Toast.warning('Please enter an exercise name.');
      return;
    }

    let normalizedTime = '';
    if (rawTime) {
      const parsed = this._parseTime(rawTime);
      if (!parsed) {
        Toast.warning('Use time format hh:mm AM/PM.');
        return;
      }
      normalizedTime = this._formatTime(parsed);
      this._setTimeState(parsed);
      if (timeInput) timeInput.value = normalizedTime;
    }

    const newExercise = {
      id: `ex-${Date.now()}`,
      name,
      time: normalizedTime,
      details,
      done: false
    };

    this._store.update('physio', (rawState) => {
      const state = this._rollWeekIfNeeded(this._normalizeState(rawState));
      return {
        ...state,
        exercises: [...state.exercises, newExercise]
      };
    });

    if (nameInput) nameInput.value = '';
    if (timeInput) timeInput.value = '';
    if (descInput) descInput.value = '';

    const nextState = this._getState();
    this._persistState(nextState);
    this._renderExercises();
    this._renderWeeklyVisuals();
    this._renderStats();
    this._syncDisplay();

    Toast.success('Exercise added to plan.');
  }

  static _initTimePicker() {
    const picker = document.getElementById('ex-time-picker');
    const input = document.getElementById('ex-time-inp');
    const trigger = document.getElementById('ex-time-trigger');
    const panel = document.getElementById('ex-time-panel');
    const hourCol = document.getElementById('ex-hour-col');
    const minCol = document.getElementById('ex-min-col');
    const merCol = document.getElementById('ex-mer-col');

    if (!picker || !input || !trigger || !panel || !hourCol || !minCol || !merCol) return;

    if (!hourCol.childElementCount) {
      hourCol.innerHTML = Array.from({ length: 12 }, (_, i) => {
        const value = String(i + 1).padStart(2, '0');
        return `<button type="button" class="time-picker-item" data-time-part="hour" data-time-value="${value}">${value}</button>`;
      }).join('');
    }

    if (!minCol.childElementCount) {
      minCol.innerHTML = Array.from({ length: 60 }, (_, i) => {
        const value = String(i).padStart(2, '0');
        return `<button type="button" class="time-picker-item" data-time-part="minute" data-time-value="${value}">${value}</button>`;
      }).join('');
    }

    if (!merCol.childElementCount) {
      merCol.innerHTML = ['AM', 'PM']
        .map((value) => `<button type="button" class="time-picker-item" data-time-part="meridiem" data-time-value="${value}">${value}</button>`)
        .join('');
    }

    const parsedFromInput = input.value.trim() ? this._parseTime(input.value.trim()) : null;
    if (parsedFromInput) {
      this._setTimeState(parsedFromInput);
    } else {
      this._syncDisplay();
    }

    if (this._pickerBound) return;

    const closePanel = () => {
      panel.classList.remove('open');
      panel.setAttribute('aria-hidden', 'true');
      trigger.setAttribute('aria-expanded', 'false');
    };

    const openPanel = () => {
      panel.classList.add('open');
      panel.setAttribute('aria-hidden', 'false');
      trigger.setAttribute('aria-expanded', 'true');
    };

    trigger.setAttribute('aria-expanded', 'false');

    trigger.addEventListener('click', (event) => {
      event.stopPropagation();
      if (panel.classList.contains('open')) {
        closePanel();
      } else {
        openPanel();
      }
    });

    panel.addEventListener('click', (event) => {
      const button = event.target.closest('[data-time-part]');
      if (!button) return;

      const part = button.getAttribute('data-time-part');
      const value = button.getAttribute('data-time-value');
      this._timeState[part] = value;
      this._syncDisplay();
      input.value = this._formatTime(this._timeState);
      input.focus();
    });

    input.addEventListener('focus', () => {
      this._syncDisplay();
    });

    input.addEventListener('blur', () => {
      const raw = input.value.trim();
      if (!raw) return;

      const parsed = this._parseTime(raw);
      if (!parsed) {
        Toast.warning('Use time format hh:mm AM/PM.');
        input.value = this._formatTime(this._timeState);
        return;
      }

      this._setTimeState(parsed);
      input.value = this._formatTime(parsed);
    });

    document.addEventListener('click', (event) => {
      if (!picker.contains(event.target)) {
        closePanel();
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        closePanel();
      }
    });

    this._pickerBound = true;
  }

  static _setTimeState(parsed) {
    this._timeState = {
      hour: parsed.hour,
      minute: parsed.minute,
      meridiem: parsed.meridiem
    };
    this._syncDisplay();
  }

  static _syncDisplay() {
    const display = document.getElementById('ex-time-display');
    const input = document.getElementById('ex-time-inp');
    const value = this._formatTime(this._timeState);

    if (display) display.textContent = value;

    document.querySelectorAll('#ex-time-panel [data-time-part]').forEach((button) => {
      const part = button.getAttribute('data-time-part');
      const entryValue = button.getAttribute('data-time-value');
      button.classList.toggle('active', this._timeState[part] === entryValue);
    });

    if (input && !input.value.trim()) {
      input.placeholder = 'hh:mm AM/PM';
    }
  }

  static _formatTime(time) {
    return `${time.hour}:${time.minute} ${time.meridiem}`;
  }

  static _parseTime(raw) {
    const match = raw.match(/^\s*(\d{1,2})(?:\s*:\s*(\d{1,2}))?\s*([AaPp][Mm])?\s*$/);
    if (!match) return null;

    let hour = Number(match[1]);
    const minute = match[2] === undefined ? 0 : Number(match[2]);
    let meridiem = match[3] ? match[3].toUpperCase() : '';

    if (!Number.isInteger(hour) || !Number.isInteger(minute) || minute < 0 || minute > 59) return null;

    if (meridiem) {
      if (hour < 1 || hour > 12) return null;
    } else {
      if (hour < 0 || hour > 23) return null;
      meridiem = hour >= 12 ? 'PM' : 'AM';
      hour = hour % 12;
      if (hour === 0) hour = 12;
    }

    return {
      hour: String(hour).padStart(2, '0'),
      minute: String(minute).padStart(2, '0'),
      meridiem
    };
  }
}
