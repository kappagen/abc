export class AchievementsPage {
  static _store = null;
  static _bound = false;
  static _subscribed = false;
  static _medicalEventBound = false;
  static _unsubscribers = [];
  static _filter = 'all';

  static BADGE_DEFS = [
    { id: 'first_login', key: 'loginCount', title: 'First Steps', short: 'FS', desc: 'Logged in for the first time', pts: 50, target: 1 },
    { id: 'streak_7', key: 'bestStreak', title: 'Week Warrior', short: 'WW', desc: 'Reach a 7-day habit streak', pts: 100, target: 7 },
    { id: 'streak_21', key: 'bestStreak', title: '21-Day Legend', short: '21', desc: 'Reach a 21-day habit streak', pts: 200, target: 21 },
    { id: 'streak_30', key: 'bestStreak', title: '30-Day Champion', short: '30', desc: 'Reach a 30-day habit streak', pts: 300, target: 30 },
    { id: 'physio_10', key: 'physioSessions', title: 'Physio Pro', short: 'P10', desc: 'Complete 10 physio sessions', pts: 150, target: 10 },
    { id: 'physio_50', key: 'physioSessions', title: 'Recovery Master', short: 'P50', desc: 'Complete 50 physio sessions', pts: 500, target: 50 },
    { id: 'course_add', key: 'coursesCount', title: 'Scholar', short: 'SC', desc: 'Add your first course', pts: 75, target: 1 },
    { id: 'record_upload', key: 'recordsCount', title: 'Organized', short: 'OR', desc: 'Upload your first medical record', pts: 50, target: 1 },
    { id: 'record_keeper', key: 'recordsCount', title: 'Record Keeper', short: 'RK', desc: 'Store 5 medical records', pts: 120, target: 5 },
    { id: 'feedback_first', key: 'feedbackCount', title: 'Voice Matters', short: 'FB', desc: 'Submit your first feedback', pts: 60, target: 1 }
  ];

  static init(store) {
    this._store = store;
    this._refresh();
    this._bindStoreSubscriptions();

    if (!this._bound) {
      this._bindFilters();
      this._bound = true;
    }
  }

  static _refresh() {
    const state = this._buildState();
    this._renderLevel(state.points);
    this._renderSummary(state);
    this._renderBadges(state.badges);
    this._syncFilterButtons();
  }

  static _metrics() {
    const habits = this._store?.get('habits') || {};
    const habitGroups = ['medical', 'physical', 'mental', 'academic', 'other']
      .map((key) => (Array.isArray(habits[key]) ? habits[key] : []));

    const allHabits = habitGroups.flat();
    const bestStreak = allHabits.reduce((max, habit) => Math.max(max, Number(habit?.n) || 0), 0);

    const physio = this._store?.get('physio') || {};
    let physioSessions = 0;
    if (physio.weeklyLog && typeof physio.weeklyLog === 'object') {
      if (Array.isArray(physio.weeklyLog)) {
        physioSessions = physio.weeklyLog.reduce((sum, val) => sum + (Number(val) || 0), 0);
      } else {
        physioSessions = Object.values(physio.weeklyLog).reduce((sum, val) => sum + (Number(val) || 0), 0);
      }
    }

    const coursesCount = Array.isArray(this._store?.get('courses')) ? this._store.get('courses').length : 0;
    const recordsCount = this._medicalRecordCount();
    const feedbackCount = Array.isArray(this._store?.get('feedback')?.submissions) ? this._store.get('feedback').submissions.length : 0;

    return {
      loginCount: 1,
      bestStreak,
      physioSessions,
      coursesCount,
      recordsCount,
      feedbackCount
    };
  }

  static _medicalRecordCount() {
    const storeRecords = Array.isArray(this._store?.get('medicalRecords'))
      ? this._store.get('medicalRecords').length
      : 0;

    let settingsRecords = 0;
    try {
      const raw = localStorage.getItem('irhlms-medical-info-v1');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed?.records)) {
          settingsRecords = parsed.records.length;
        }
      }
    } catch {
      settingsRecords = 0;
    }

    return Math.max(storeRecords, settingsRecords);
  }

  static _buildState() {
    const metrics = this._metrics();

    const badges = this.BADGE_DEFS.map((def) => {
      const current = Number(metrics[def.key]) || 0;
      const unlocked = current >= def.target;
      return {
        ...def,
        current,
        unlocked,
        progressPct: Math.min(100, Math.round((current / def.target) * 100))
      };
    });

    const points = badges.filter((badge) => badge.unlocked).reduce((sum, badge) => sum + badge.pts, 0);
    const unlockedCount = badges.filter((badge) => badge.unlocked).length;
    const lockedCount = badges.length - unlockedCount;

    const nextBadge = badges
      .filter((badge) => !badge.unlocked)
      .sort((a, b) => (a.target - a.current) - (b.target - b.current))[0] || null;

    return {
      metrics,
      badges,
      points,
      unlockedCount,
      lockedCount,
      nextBadge
    };
  }

  static _renderLevel(points) {
    const level = Math.floor(points / 200) + 1;
    const levelProgress = points % 200;
    const pct = Math.min(100, (levelProgress / 200) * 100);

    const levelEl = document.getElementById('ach-level');
    const ptsEl = document.getElementById('ach-pts');
    const barEl = document.getElementById('ach-bar');
    const capEl = document.getElementById('ach-cap');

    if (levelEl) levelEl.textContent = `Level ${level}`;
    if (ptsEl) ptsEl.textContent = `${points} total points`;
    if (barEl) barEl.style.width = `${pct}%`;
    if (capEl) capEl.textContent = `${200 - levelProgress} pts to Level ${level + 1}`;
  }

  static _renderSummary(state) {
    const unlockedEl = document.getElementById('ach-unlocked-count');
    const lockedEl = document.getElementById('locked-cnt');
    const nextEl = document.getElementById('ach-next-badge');

    if (unlockedEl) unlockedEl.textContent = String(state.unlockedCount);
    if (lockedEl) lockedEl.textContent = String(state.lockedCount);

    if (nextEl) {
      if (!state.nextBadge) {
        nextEl.textContent = 'All unlocked';
      } else {
        const remaining = Math.max(0, state.nextBadge.target - state.nextBadge.current);
        nextEl.textContent = `${state.nextBadge.title} (${remaining} to go)`;
      }
    }
  }

  static _renderBadges(allBadges) {
    const wrap = document.getElementById('badges-wrap');
    if (!wrap) return;

    const filtered = allBadges.filter((badge) => {
      if (this._filter === 'unlocked') return badge.unlocked;
      if (this._filter === 'locked') return !badge.unlocked;
      return true;
    });

    if (!filtered.length) {
      wrap.innerHTML = '<div class="ach-empty">No badges in this filter yet.</div>';
      return;
    }

    wrap.innerHTML = filtered
      .map((badge) => {
        const progressText = badge.unlocked
          ? 'Unlocked'
          : `${badge.current}/${badge.target} completed`;
        const badgeClass = badge.unlocked ? 'unlocked' : 'locked';
        const badgePillClass = badge.unlocked ? 'badge badge-gold' : 'badge';

        return `
          <article class="ach-badge-card ${badgeClass}">
            <div class="ach-badge-icon">${badge.short}</div>
            <div style="flex:1;min-width:0">
              <div class="ach-badge-title">${badge.title}</div>
              <div class="ach-badge-desc">${badge.desc}</div>
              <div class="ach-badge-foot">
                <span class="${badgePillClass}">+${badge.pts}</span>
                <span class="ach-progress-note">${progressText}</span>
              </div>
              ${
                badge.unlocked
                  ? ''
                  : `<div class="prog-bg" style="margin-top:8px;height:6px"><div class="prog-fill" style="width:${badge.progressPct}%;background:linear-gradient(90deg,var(--gold),var(--gold-lt));height:100%"></div></div>`
              }
            </div>
          </article>
        `;
      })
      .join('');
  }

  static _bindFilters() {
    document.querySelectorAll('[data-ach-filter]').forEach((button) => {
      button.addEventListener('click', () => {
        this._filter = button.dataset.achFilter || 'all';
        const state = this._buildState();
        this._renderBadges(state.badges);
        this._syncFilterButtons();
      });
    });
  }

  static _bindStoreSubscriptions() {
    if (this._subscribed || !this._store?.subscribe) return;

    const keys = ['habits', 'physio', 'courses', 'medicalRecords', 'feedback'];
    this._unsubscribers = keys.map((key) => this._store.subscribe(key, () => this._refresh()));
    this._subscribed = true;

    if (!this._medicalEventBound) {
      window.addEventListener('irhlms-medical-updated', () => this._refresh());
      window.addEventListener('storage', (event) => {
        if (event.key === 'irhlms-medical-info-v1') {
          this._refresh();
        }
      });
      this._medicalEventBound = true;
    }
  }

  static _syncFilterButtons() {
    document.querySelectorAll('[data-ach-filter]').forEach((button) => {
      const active = button.dataset.achFilter === this._filter;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  }
}
