let _container = null;
function _getContainer() {
  if (!_container) {
    _container = Object.assign(document.createElement('div'), {
      style: 'position:fixed;bottom:24px;right:24px;display:flex;flex-direction:column;gap:8px;z-index:9999;pointer-events:none'
    });
    document.body.appendChild(_container);
  }
  return _container;
}

function _show(msg, { bg = 'var(--navy)', color = '#fff', icon = '' } = {}) {
  const t = document.createElement('div');
  t.innerHTML = `<span style="font-size:11px;font-weight:700;letter-spacing:.04em">${icon}</span> ${msg}`;
  Object.assign(t.style, {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '11px 18px',
    borderRadius: '10px',
    background: bg,
    color,
    fontSize: '13px',
    fontWeight: '500',
    fontFamily: 'var(--font-body)',
    boxShadow: '0 4px 20px rgba(0,0,0,0.18)',
    animation: 'fadeUp .25s ease',
    opacity: '1',
    transition: 'opacity .3s ease',
    pointerEvents: 'auto',
    maxWidth: '300px'
  });
  _getContainer().appendChild(t);
  setTimeout(() => {
    t.style.opacity = '0';
    setTimeout(() => t.remove(), 300);
  }, 3200);
}

export const Toast = {
  show: (msg, opts) => _show(msg, opts),
  success: (msg) => _show(msg, { bg: 'var(--teal)', icon: 'OK' }),
  error: (msg) => _show(msg, { bg: 'var(--rose)', icon: 'ERR' }),
  info: (msg) => _show(msg, { bg: 'var(--blue)', icon: 'INFO' }),
  warning: (msg) => _show(msg, { bg: 'var(--amber)', icon: 'WARN', color: 'var(--navy-deep)' })
};
