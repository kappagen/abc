import { Toast } from '../../utilities/toast.js';

export class FeedbackPage {
  static _isBound = false;

  static init(store) {
    const state = this._ensureFeedbackState(store);
    if (!this._isBound) {
      this._bindStars(store);
      this._bindCats(store);
      this._bindTypes(store);
      this._bindAnonymous(store);
      this._bindSubmit(store);
      this._isBound = true;
    }
    this._syncUi(state);
    this._renderHistory(state.submissions);
  }

  static _normalizeState(feedback = {}) {
    const rating = Number.parseInt(feedback.rating, 10);
    return {
      rating: Number.isFinite(rating) ? Math.min(Math.max(rating, 0), 5) : 0,
      category: feedback.category || 'general',
      type: feedback.type || 'positive',
      anonymous: Boolean(feedback.anonymous),
      submissions: Array.isArray(feedback.submissions) ? feedback.submissions : []
    };
  }

  static _ensureFeedbackState(store) {
    const current = store.get('feedback');
    const normalized = this._normalizeState(current);
    const shouldHydrate =
      !current ||
      current.category === undefined ||
      current.type === undefined ||
      current.anonymous === undefined ||
      !Array.isArray(current.submissions);

    if (shouldHydrate) {
      store.set('feedback', normalized);
    }
    return normalized;
  }

  static _bindStars(store) {
    document.querySelectorAll('.star-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const rating = Number.parseInt(btn.dataset.v, 10) || 0;
        store.update('feedback', (feedback) => ({
          ...this._normalizeState(feedback),
          rating
        }));
        this._applyRatingUi(rating);
      });
    });
  }

  static _bindCats(store) {
    document.querySelectorAll('.fb-cat-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const category = btn.dataset.cat || 'general';
        store.update('feedback', (feedback) => ({
          ...this._normalizeState(feedback),
          category
        }));
        this._setActive('.fb-cat-btn', 'cat', category);
      });
    });
  }

  static _bindTypes(store) {
    document.querySelectorAll('.fb-type-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const type = btn.dataset.type || 'positive';
        store.update('feedback', (feedback) => ({
          ...this._normalizeState(feedback),
          type
        }));
        this._setActive('.fb-type-btn', 'type', type);
      });
    });
  }

  static _bindAnonymous(store) {
    document.getElementById('fb-anon')?.addEventListener('click', (event) => {
      const button = event.currentTarget;
      const anonymous = !button.classList.contains('on');
      button.classList.toggle('on', anonymous);
      store.update('feedback', (feedback) => ({
        ...this._normalizeState(feedback),
        anonymous
      }));
    });
  }

  static _bindSubmit(store) {
    document.getElementById('submit-fb-btn')?.addEventListener('click', () => {
      const title = document.getElementById('fb-title')?.value.trim();
      const msg = document.getElementById('fb-msg')?.value.trim();
      const state = this._normalizeState(store.get('feedback'));

      if (!title || !msg) {
        Toast.warning('Please fill in all fields.');
        return;
      }
      if (!state.rating) {
        Toast.warning('Please select a rating.');
        return;
      }

      const submission = {
        id: Date.now(),
        title,
        msg,
        rating: state.rating,
        cat: state.category,
        type: state.type,
        anon: state.anonymous,
        date: new Date().toLocaleDateString('en-GB')
      };

      store.update('feedback', (feedback) => {
        const safe = this._normalizeState(feedback);
        return {
          ...safe,
          rating: 0,
          category: 'general',
          type: 'positive',
          anonymous: false,
          submissions: [submission, ...safe.submissions]
        };
      });

      const titleInput = document.getElementById('fb-title');
      const messageInput = document.getElementById('fb-msg');
      if (titleInput) titleInput.value = '';
      if (messageInput) messageInput.value = '';

      const nextState = this._normalizeState(store.get('feedback'));
      this._syncUi(nextState);
      this._renderHistory(nextState.submissions);
      Toast.success('Feedback submitted. Thank you.');
    });
  }

  static _setActive(selector, key, value) {
    document.querySelectorAll(selector).forEach((button) => {
      button.classList.toggle('active', button.dataset[key] === value);
    });
  }

  static _applyRatingUi(rating) {
    const messages = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];
    const msgEl = document.getElementById('star-msg');
    if (msgEl) {
      msgEl.textContent = rating ? messages[rating] || '' : 'Tap a star to rate';
    }

    document.querySelectorAll('.star-btn').forEach((star, index) => {
      const isActive = index < rating;
      star.style.transform = isActive ? 'scale(1.15)' : 'scale(1)';
      star.style.opacity = isActive ? '1' : '0.4';
    });
  }

  static _syncUi(state) {
    this._setActive('.fb-cat-btn', 'cat', state.category);
    this._setActive('.fb-type-btn', 'type', state.type);
    document.getElementById('fb-anon')?.classList.toggle('on', state.anonymous);
    this._applyRatingUi(state.rating);
  }

  static _profileShortName() {
    try {
      const raw = localStorage.getItem('irhlms-profile-v1');
      if (!raw) return 'User';
      const parsed = JSON.parse(raw);
      const parts = String(parsed.fullName || '')
        .trim()
        .split(/\s+/)
        .filter(Boolean);
      if (!parts.length) return 'User';
      if (parts.length === 1) return parts[0];
      return `${parts[0]} ${parts[1][0]}.`;
    } catch {
      return 'User';
    }
  }

  static _renderHistory(submissions) {
    const wrap = document.getElementById('fb-history');
    if (!wrap) return;

    if (!submissions.length) {
      wrap.innerHTML = '<div style="padding:24px;text-align:center;color:var(--txt3);font-size:13px">No submissions yet.</div>';
      return;
    }

    wrap.innerHTML = '';
    submissions.forEach((submission) => {
      const row = document.createElement('div');
      row.style.padding = '14px 20px';
      row.style.borderBottom = '1px solid var(--border)';

      const head = document.createElement('div');
      head.style.display = 'flex';
      head.style.alignItems = 'center';
      head.style.justifyContent = 'space-between';
      head.style.marginBottom = '4px';

      const title = document.createElement('div');
      title.style.fontSize = '13px';
      title.style.fontWeight = '500';
      title.style.color = 'var(--txt1)';
      title.textContent = submission.title || 'Untitled feedback';

      const date = document.createElement('div');
      date.style.fontSize = '11px';
      date.style.color = 'var(--txt3)';
      date.textContent = submission.date || '';

      const meta = document.createElement('div');
      meta.style.fontSize = '11px';
      meta.style.color = 'var(--txt3)';
      const rating = Number.parseInt(submission.rating, 10) || 0;
      meta.textContent = `${rating}/5 | ${submission.cat || 'general'} | ${submission.anon ? 'Anonymous' : this._profileShortName()}`;

      const message = document.createElement('div');
      message.style.marginTop = '6px';
      message.style.fontSize = '12px';
      message.style.color = 'var(--txt2)';
      message.style.lineHeight = '1.45';
      message.textContent = submission.msg || '';

      head.append(title, date);
      row.append(head, meta, message);
      wrap.appendChild(row);
    });
  }
}
