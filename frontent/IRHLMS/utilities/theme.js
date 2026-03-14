export class ThemeManager {
  constructor() {
    this._root = document.documentElement;
    this._theme = localStorage.getItem('irhlms-theme') || 'light';
    this._contrast = localStorage.getItem('irhlms-contrast') || 'normal';
    this._fontSize = localStorage.getItem('irhlms-fontsize') || 'md';
    this._motion = localStorage.getItem('irhlms-motion') || 'normal';
    this._bound = false;
  }

  init() {
    this._applyAll();
    this._syncControls();
    this._bindControls();
  }

  toggle() {
    this._theme = this._theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('irhlms-theme', this._theme);
    this._root.setAttribute('data-theme', this._theme);
    this._syncControls();
  }

  setFontSize(size) {
    const allowed = new Set(['sm', 'md', 'lg', 'xl']);
    if (!allowed.has(size)) return;

    this._fontSize = size;
    localStorage.setItem('irhlms-fontsize', size);
    this._root.setAttribute('data-fontsize', size);
    this._syncControls();
  }

  setContrast(high) {
    this._contrast = high ? 'high' : 'normal';
    localStorage.setItem('irhlms-contrast', this._contrast);
    this._root.setAttribute('data-contrast', this._contrast);
    this._syncControls();
  }

  setMotion(reduced) {
    this._motion = reduced ? 'reduce' : 'normal';
    localStorage.setItem('irhlms-motion', this._motion);
    this._root.setAttribute('data-motion', this._motion);
    this._root.style.setProperty('--tr', reduced ? '0s' : '0.22s cubic-bezier(.4,0,.2,1)');
    this._syncControls();
  }

  _applyAll() {
    this._root.setAttribute('data-theme', this._theme);
    this._root.setAttribute('data-contrast', this._contrast);
    this._root.setAttribute('data-fontsize', this._fontSize);
    this._root.setAttribute('data-motion', this._motion);
    this._root.style.setProperty('--tr', this._motion === 'reduce' ? '0s' : '0.22s cubic-bezier(.4,0,.2,1)');
  }

  _syncControls() {
    const darkToggle = document.getElementById('t-dark');
    const contrastToggle = document.getElementById('t-contrast');
    const motionToggle = document.getElementById('t-motion');

    if (darkToggle) darkToggle.classList.toggle('on', this._theme === 'dark');
    if (contrastToggle) contrastToggle.classList.toggle('on', this._contrast === 'high');
    if (motionToggle) motionToggle.classList.toggle('on', this._motion === 'reduce');

    document.querySelectorAll('[data-size]').forEach((button) => {
      const isActive = button.dataset.size === this._fontSize;
      button.classList.toggle('active', isActive);
      button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
  }

  _bindControls() {
    if (this._bound) return;

    document.getElementById('t-dark')?.addEventListener('click', () => {
      this.toggle();
    });

    document.getElementById('t-contrast')?.addEventListener('click', (event) => {
      const high = !event.currentTarget.classList.contains('on');
      this.setContrast(high);
    });

    document.getElementById('t-motion')?.addEventListener('click', (event) => {
      const reduced = !event.currentTarget.classList.contains('on');
      this.setMotion(reduced);
    });

    document.querySelectorAll('[data-size]').forEach((button) => {
      button.addEventListener('click', () => this.setFontSize(button.dataset.size));
    });

    this._bound = true;
  }
}
