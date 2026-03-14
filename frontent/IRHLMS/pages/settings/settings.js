import { Toast } from '../../utilities/toast.js';

const NOTIFICATION_STORAGE_KEY = 'irhlms-notification-settings-v1';
const PROFILE_STORAGE_KEY = 'irhlms-profile-v1';
const MEDICAL_STORAGE_KEY = 'irhlms-medical-info-v1';

const DEFAULT_NOTIFICATION_SETTINGS = {
  physioReminders: true,
  habitReminders: true,
  streakAlerts: true
};

const DEFAULT_PROFILE = {
  fullName: 'Yug Suhagiya',
  studentId: 'B24CS1073',
  program: 'CSE',
  institute: 'IIT Jodhpur',
  recoveryWeek: 'Week 9'
};

const DEFAULT_MEDICAL_INFO = {
  records: [
    {
      id: 'medical-default',
      diagnosis: 'Incomplete Spinal Cord Injury - L2 level',
      medications: 'Baclofen 10mg | Vitamin D 2000IU | Aspirin 75mg',
      allergies: 'Penicillin | Latex',
      createdAt: ''
    }
  ],
  updatedAt: ''
};

export class SettingsPage {
  static _bound = false;
  static _medicalMode = 'edit';

  static init() {
    this._syncNotificationToggles();
    this._syncProfileUi();
    this._syncMedicalUi();

    if (this._bound) return;
    this._bindNotificationToggles();
    this._bindProfileEditor();
    this._bindMedicalEditor();
    this._bound = true;
  }

  static _readNotificationSettings() {
    try {
      const raw = localStorage.getItem(NOTIFICATION_STORAGE_KEY);
      if (!raw) return { ...DEFAULT_NOTIFICATION_SETTINGS };

      const parsed = JSON.parse(raw);
      return {
        physioReminders: parsed.physioReminders !== false,
        habitReminders: parsed.habitReminders !== false,
        streakAlerts: parsed.streakAlerts !== false
      };
    } catch {
      return { ...DEFAULT_NOTIFICATION_SETTINGS };
    }
  }

  static _saveNotificationSettings(settings) {
    try {
      localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // Ignore storage errors.
    }
  }

  static _syncNotificationToggles() {
    const settings = this._readNotificationSettings();

    document.querySelectorAll('[data-notif-key]').forEach((button) => {
      const key = button.getAttribute('data-notif-key');
      const enabled = Boolean(settings[key]);
      button.classList.toggle('on', enabled);
      button.setAttribute('aria-pressed', enabled ? 'true' : 'false');
    });
  }

  static _bindNotificationToggles() {
    document.querySelectorAll('[data-notif-key]').forEach((button) => {
      button.addEventListener('click', () => {
        const key = button.getAttribute('data-notif-key');
        if (!key) return;

        const settings = this._readNotificationSettings();
        const nextValue = !Boolean(settings[key]);
        settings[key] = nextValue;

        this._saveNotificationSettings(settings);
        button.classList.toggle('on', nextValue);
        button.setAttribute('aria-pressed', nextValue ? 'true' : 'false');
      });
    });
  }

  static _readProfile() {
    const withFallback = (value, fallback) => {
      const text = String(value || '').trim();
      return text || fallback;
    };

    try {
      const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
      if (!raw) return { ...DEFAULT_PROFILE };

      const parsed = JSON.parse(raw);
      return {
        fullName: withFallback(parsed.fullName, DEFAULT_PROFILE.fullName),
        studentId: withFallback(parsed.studentId, DEFAULT_PROFILE.studentId),
        program: withFallback(parsed.program, DEFAULT_PROFILE.program),
        institute: withFallback(parsed.institute, DEFAULT_PROFILE.institute),
        recoveryWeek: withFallback(parsed.recoveryWeek, DEFAULT_PROFILE.recoveryWeek)
      };
    } catch {
      return { ...DEFAULT_PROFILE };
    }
  }

  static _saveProfile(profile) {
    try {
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
    } catch {
      // Ignore storage errors.
    }
  }

  static _buildInitials(fullName) {
    const initials = String(fullName)
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || '')
      .join('');
    return initials || 'NA';
  }

  static _metaText(profile) {
    return `${profile.studentId} · ${profile.program}, ${profile.institute}`;
  }

  static _roleText(profile) {
    return `${profile.studentId} · ${profile.recoveryWeek}`;
  }

  static _firstName(fullName) {
    return String(fullName).trim().split(/\s+/).filter(Boolean)[0] || 'there';
  }

  static _applyProfile(profile) {
    const initials = this._buildInitials(profile.fullName);

    const settingsName = document.getElementById('settings-profile-name');
    const settingsMeta = document.getElementById('settings-profile-meta');
    const settingsAvatar = document.getElementById('settings-profile-avatar');

    if (settingsName) settingsName.textContent = profile.fullName;
    if (settingsMeta) settingsMeta.textContent = this._metaText(profile);
    if (settingsAvatar) settingsAvatar.textContent = initials;

    const sidebarName = document.getElementById('sidebar-user-name');
    const sidebarRole = document.getElementById('sidebar-user-role');
    const sidebarAvatar = document.getElementById('sidebar-user-avatar');

    if (sidebarName) sidebarName.textContent = profile.fullName;
    if (sidebarRole) sidebarRole.textContent = this._roleText(profile);
    if (sidebarAvatar) sidebarAvatar.textContent = initials;

    const greeting = document.getElementById('dashboard-greeting');
    if (greeting) greeting.textContent = `Good morning, ${this._firstName(profile.fullName)} 👋`;
  }

  static _syncProfileUi() {
    const profile = this._readProfile();
    this._applyProfile(profile);
  }

  static _setProfileFormVisible(visible) {
    const card = document.getElementById('settings-profile-form-card');
    if (!card) return;
    card.style.display = visible ? '' : 'none';
  }

  static _fillProfileForm(profile) {
    const nameInput = document.getElementById('profile-name-inp');
    const studentIdInput = document.getElementById('profile-student-id-inp');
    const programInput = document.getElementById('profile-program-inp');
    const instituteInput = document.getElementById('profile-institute-inp');
    const weekInput = document.getElementById('profile-week-inp');

    if (nameInput) nameInput.value = profile.fullName;
    if (studentIdInput) studentIdInput.value = profile.studentId;
    if (programInput) programInput.value = profile.program;
    if (instituteInput) instituteInput.value = profile.institute;
    if (weekInput) weekInput.value = profile.recoveryWeek;
  }

  static _bindProfileEditor() {
    const editBtn = document.getElementById('settings-profile-edit-btn');
    const saveBtn = document.getElementById('settings-profile-save-btn');
    const cancelBtn = document.getElementById('settings-profile-cancel-btn');

    editBtn?.addEventListener('click', () => {
      const profile = this._readProfile();
      this._fillProfileForm(profile);
      this._setProfileFormVisible(true);
      document.getElementById('profile-name-inp')?.focus();
    });

    cancelBtn?.addEventListener('click', () => {
      this._setProfileFormVisible(false);
    });

    saveBtn?.addEventListener('click', () => {
      const profile = {
        fullName: document.getElementById('profile-name-inp')?.value.trim() || '',
        studentId: document.getElementById('profile-student-id-inp')?.value.trim() || '',
        program: document.getElementById('profile-program-inp')?.value.trim() || '',
        institute: document.getElementById('profile-institute-inp')?.value.trim() || '',
        recoveryWeek: document.getElementById('profile-week-inp')?.value.trim() || ''
      };

      if (!profile.fullName || !profile.studentId || !profile.program || !profile.institute) {
        Toast.warning('Please fill all required profile fields.');
        return;
      }

      if (!profile.recoveryWeek) {
        profile.recoveryWeek = DEFAULT_PROFILE.recoveryWeek;
      }

      this._saveProfile(profile);
      this._applyProfile(profile);
      this._setProfileFormVisible(false);
      Toast.success('Profile updated successfully.');
    });
  }

  static _readMedicalInfo() {
    const withFallback = (value, fallback) => {
      const text = String(value || '').trim();
      return text || fallback;
    };
    const defaultRecord = DEFAULT_MEDICAL_INFO.records[0];
    const normalizeRecord = (record = {}, index = 0) => ({
      id: String(record.id || `medical-${Date.now()}-${index}`),
      diagnosis: withFallback(record.diagnosis, defaultRecord.diagnosis),
      medications: withFallback(record.medications, defaultRecord.medications),
      allergies: withFallback(record.allergies, defaultRecord.allergies),
      createdAt: String(record.createdAt || '')
    });

    try {
      const raw = localStorage.getItem(MEDICAL_STORAGE_KEY);
      if (!raw) {
        return {
          records: DEFAULT_MEDICAL_INFO.records.map((record, index) => normalizeRecord(record, index)),
          updatedAt: DEFAULT_MEDICAL_INFO.updatedAt
        };
      }

      const parsed = JSON.parse(raw);
      let records = [];
      const hasRecordsArray = Array.isArray(parsed.records);

      if (hasRecordsArray) {
        records = parsed.records.map((record, index) => normalizeRecord(record, index));
      } else if (parsed.diagnosis || parsed.medications || parsed.allergies) {
        records = [normalizeRecord(parsed, 0)];
      }

      if (!hasRecordsArray && !records.length) {
        records = DEFAULT_MEDICAL_INFO.records.map((record, index) => normalizeRecord(record, index));
      }

      return {
        records,
        updatedAt: String(parsed.updatedAt || records[0]?.createdAt || '').trim()
      };
    } catch {
      return {
        records: DEFAULT_MEDICAL_INFO.records.map((record, index) => normalizeRecord(record, index)),
        updatedAt: DEFAULT_MEDICAL_INFO.updatedAt
      };
    }
  }

  static _saveMedicalInfo(info) {
    try {
      localStorage.setItem(MEDICAL_STORAGE_KEY, JSON.stringify(info));
    } catch {
      // Ignore storage errors.
    }
  }

  static _applyMedicalInfo(info) {
    const list = document.getElementById('settings-medical-list');
    const updated = document.getElementById('settings-medical-updated');

    if (list) {
      list.innerHTML = '';
      if (!info.records.length) {
        const empty = document.createElement('div');
        empty.className = 'settings-medical-empty';
        empty.textContent = 'No medical information added yet.';
        list.appendChild(empty);
      }

      info.records.forEach((record) => {
        const group = document.createElement('div');
        group.className = 'settings-medical-group';
        group.dataset.medicalId = record.id;

        const topRow = document.createElement('div');
        topRow.className = 'settings-medical-row';

        const meta = document.createElement('div');
        meta.className = 'settings-medical-meta';
        const recordTime = this._formatRecordDate(record.createdAt);
        meta.textContent = recordTime ? `Updated ${recordTime}` : '';

        const deleteBtn = document.createElement('button');
        deleteBtn.type = 'button';
        deleteBtn.className = 'btn btn-outline btn-sm settings-medical-delete-btn';
        deleteBtn.setAttribute('data-medical-delete', record.id);
        deleteBtn.textContent = 'Delete';

        const diagnosisItem = this._buildMedicalItem('Diagnosis', record.diagnosis);
        const medicationsItem = this._buildMedicalItem('Medications', record.medications);
        const allergiesItem = this._buildMedicalItem('Allergies', record.allergies);

        topRow.append(meta, deleteBtn);
        group.append(topRow, diagnosisItem, medicationsItem, allergiesItem);
        list.appendChild(group);
      });
    }

    if (updated) updated.textContent = `Last updated: ${this._formatUpdatedAt(info.updatedAt)}`;
  }

  static _formatRecordDate(value) {
    const date = value ? new Date(value) : null;
    if (!date || Number.isNaN(date.getTime())) return '';
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  static _buildMedicalItem(labelText, valueText) {
    const item = document.createElement('div');
    item.className = 'settings-medical-item';

    const label = document.createElement('div');
    label.className = 'settings-medical-label';
    label.textContent = labelText;

    const value = document.createElement('div');
    value.className = 'settings-medical-value';
    value.textContent = valueText;

    item.append(label, value);
    return item;
  }

  static _formatUpdatedAt(value) {
    const date = value ? new Date(value) : null;
    if (!date || Number.isNaN(date.getTime())) return 'Not updated yet';
    return date.toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  static _syncMedicalUi() {
    this._applyMedicalInfo(this._readMedicalInfo());
  }

  static _setMedicalFormVisible(visible) {
    const card = document.getElementById('settings-medical-form-card');
    if (!card) return;
    card.style.display = visible ? '' : 'none';
  }

  static _fillMedicalForm(info) {
    const diagnosisInput = document.getElementById('medical-diagnosis-inp');
    const medicationsInput = document.getElementById('medical-medications-inp');
    const allergiesInput = document.getElementById('medical-allergies-inp');

    if (diagnosisInput) diagnosisInput.value = info?.diagnosis || '';
    if (medicationsInput) medicationsInput.value = info?.medications || '';
    if (allergiesInput) allergiesInput.value = info?.allergies || '';
  }

  static _clearMedicalForm() {
    const diagnosisInput = document.getElementById('medical-diagnosis-inp');
    const medicationsInput = document.getElementById('medical-medications-inp');
    const allergiesInput = document.getElementById('medical-allergies-inp');

    if (diagnosisInput) diagnosisInput.value = '';
    if (medicationsInput) medicationsInput.value = '';
    if (allergiesInput) allergiesInput.value = '';
  }

  static _bindMedicalEditor() {
    const infoBtn = document.getElementById('settings-medical-info-btn');
    const addBtn = document.getElementById('settings-medical-add-btn');
    const editBtn = document.getElementById('settings-medical-edit-btn');
    const saveBtn = document.getElementById('settings-medical-save-btn');
    const cancelBtn = document.getElementById('settings-medical-cancel-btn');
    const list = document.getElementById('settings-medical-list');

    infoBtn?.addEventListener('click', () => {
      this._syncMedicalUi();
      document.getElementById('settings-medical-list')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });

    addBtn?.addEventListener('click', () => {
      this._medicalMode = 'add';
      this._clearMedicalForm();
      this._setMedicalFormVisible(true);
      document.getElementById('medical-diagnosis-inp')?.focus();
    });

    editBtn?.addEventListener('click', () => {
      this._medicalMode = 'edit';
      const info = this._readMedicalInfo();

      if (!info.records.length) {
        this._medicalMode = 'add';
        this._clearMedicalForm();
        this._setMedicalFormVisible(true);
        document.getElementById('medical-diagnosis-inp')?.focus();
        Toast.info('No medical record found. Add a new one.');
        return;
      }

      const latest = info.records[0];
      this._fillMedicalForm(latest);
      this._setMedicalFormVisible(true);
      document.getElementById('medical-diagnosis-inp')?.focus();
    });

    list?.addEventListener('click', (event) => {
      const deleteBtn = event.target.closest('[data-medical-delete]');
      if (!deleteBtn) return;

      const recordId = deleteBtn.getAttribute('data-medical-delete');
      if (!recordId) return;
      this._deleteMedicalRecord(recordId);
    });

    cancelBtn?.addEventListener('click', () => {
      this._setMedicalFormVisible(false);
      this._medicalMode = 'edit';
    });

    saveBtn?.addEventListener('click', () => {
      const info = {
        diagnosis: document.getElementById('medical-diagnosis-inp')?.value.trim() || '',
        medications: document.getElementById('medical-medications-inp')?.value.trim() || '',
        allergies: document.getElementById('medical-allergies-inp')?.value.trim() || '',
        updatedAt: new Date().toISOString()
      };

      if (!info.diagnosis || !info.medications || !info.allergies) {
        Toast.warning('Please fill diagnosis, medications, and allergies.');
        return;
      }

      const savedAt = info.updatedAt;
      const medicalState = this._readMedicalInfo();
      const newRecord = {
        id: `medical-${Date.now()}`,
        diagnosis: info.diagnosis,
        medications: info.medications,
        allergies: info.allergies,
        createdAt: savedAt
      };

      if (this._medicalMode === 'add' || !medicalState.records.length) {
        medicalState.records = [newRecord, ...medicalState.records];
      } else {
        const existing = medicalState.records[0];
        medicalState.records = [
          {
            ...existing,
            diagnosis: newRecord.diagnosis,
            medications: newRecord.medications,
            allergies: newRecord.allergies,
            createdAt: existing?.createdAt || newRecord.createdAt
          },
          ...medicalState.records.slice(1)
        ];
      }

      medicalState.updatedAt = savedAt;
      this._saveMedicalInfo(medicalState);
      window.dispatchEvent(new Event('irhlms-medical-updated'));
      this._applyMedicalInfo(medicalState);
      this._setMedicalFormVisible(false);
      Toast.success(this._medicalMode === 'add' ? 'Medical information added.' : 'Medical information updated.');
      this._medicalMode = 'edit';
    });
  }

  static _deleteMedicalRecord(recordId) {
    const medicalState = this._readMedicalInfo();
    const nextRecords = medicalState.records.filter((record) => record.id !== recordId);

    if (nextRecords.length === medicalState.records.length) return;

    medicalState.records = nextRecords;
    medicalState.updatedAt = new Date().toISOString();
    this._saveMedicalInfo(medicalState);
    window.dispatchEvent(new Event('irhlms-medical-updated'));
    this._applyMedicalInfo(medicalState);
    this._medicalMode = 'edit';
    Toast.success('Medical information deleted.');
  }
}
