import { Toast } from '../../utilities/toast.js';
import { debounce } from '../../scripts/helpers/dom.js';

export class MedicalPage {
  static _nextId = 5;

  static init(store) {
    this._render(store.get('medicalRecords'));

    document.getElementById('rec-search')?.addEventListener(
      'input',
      debounce((event) => {
        const query = event.target.value.toLowerCase();
        const records = (store.get('medicalRecords') || []).filter((record) =>
          String(record?.name || '').toLowerCase().includes(query)
        );
        this._render(records);
      }, 300)
    );

    document.getElementById('open-rec-form')?.addEventListener('click', () => {
      const form = document.getElementById('rec-form');
      if (form) form.style.display = '';
    });

    document.getElementById('close-rec-form')?.addEventListener('click', () => {
      const form = document.getElementById('rec-form');
      if (form) form.style.display = 'none';
    });

    document.getElementById('save-rec-btn')?.addEventListener('click', () => {
      const name = document.getElementById('rf-name')?.value.trim();
      const type = document.getElementById('rf-type')?.value;
      const date = document.getElementById('rf-date')?.value;

      if (!name) {
        Toast.warning('Document name required.');
        return;
      }

      store.update('medicalRecords', (records = []) => [
        ...records,
        { id: this._nextId++, name, type, date }
      ]);

      const form = document.getElementById('rec-form');
      if (form) form.style.display = 'none';

      this._render(store.get('medicalRecords') || []);
      Toast.success('Record added!');
    });
  }

  static _render(records) {
    const wrap = document.getElementById('rec-wrap');
    if (!wrap) return;

    const fileTypeLabels = { pdf: 'PDF', img: 'IMG', doc: 'DOC' };
    const colors = { pdf: 'var(--rose)', img: 'var(--teal)', doc: 'var(--violet)' };

    if (!records?.length) {
      wrap.innerHTML =
        '<div style="text-align:center;padding:40px;color:var(--txt3);font-size:13px">No records found.</div>';
      return;
    }

    wrap.innerHTML = records
      .map((record) => {
        const type = String(record?.type || '').toLowerCase();
        const badgeText = (type || 'file').toUpperCase();
        const iconText = fileTypeLabels[type] || 'FILE';
        const color = colors[type] || 'var(--txt2)';

        return `
      <div style="display:flex;align-items:center;gap:14px;padding:14px 20px;background:var(--surface);border:1px solid var(--border);border-radius:12px;margin-bottom:10px">
        <div style="width:38px;height:38px;border-radius:10px;background:var(--surface2);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;flex-shrink:0">${iconText}</div>
        <div style="flex:1">
          <div style="font-size:13px;font-weight:500;color:var(--txt1)">${record.name}</div>
          <div style="font-size:11px;color:var(--txt3);margin-top:2px">${badgeText} | ${record.date || '-'}</div>
        </div>
        <span class="badge" style="background:var(--surface2);color:${color}">${badgeText}</span>
      </div>`;
      })
      .join('');
  }
}
