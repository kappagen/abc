export class Store {
  constructor(initialState = {}) {
    this._state = structuredClone(initialState);
    this._listeners = {};
  }

  get(key) {
    return this._state[key];
  }

  set(key, value) {
    this._state[key] = value;
    this._emit(key, value);
  }

  update(key, updater) {
    this.set(key, updater(structuredClone(this._state[key])));
  }

  subscribe(key, listener) {
    if (!this._listeners[key]) {
      this._listeners[key] = [];
    }
    this._listeners[key].push(listener);
    return () => {
      this._listeners[key] = this._listeners[key].filter((fn) => fn !== listener);
    };
  }

  _emit(key, value) {
    (this._listeners[key] || []).forEach((listener) => listener(value));
  }
}

export const initialState = {
  habits: {
    medical: [
      { t: 'Morning Medication', d: 'After breakfast', s: false, n: 47 },
      { t: 'Evening Medication', d: 'After dinner', s: false, n: 47 },
      { t: 'Blood Pressure Check', d: 'Log reading', s: false, n: 26 }
    ],
    physical: [
      { t: 'Morning Stretching', d: '15 min ROM exercises', s: false, n: 34 },
      { t: 'Resistance Band', d: '3 sets upper body', s: false, n: 22 },
      { t: 'Wheelchair Mobility', d: '30 min indoor route', s: false, n: 18 }
    ],
    mental: [
      { t: 'Mindfulness Breathing', d: '10 min guided session', s: false, n: 29 },
      { t: 'Journal Reflection', d: 'Write 5 minutes', s: false, n: 20 }
    ],
    academic: [
      { t: 'DSA Practice', d: 'Pomodoro x 4', s: false, n: 31 },
      { t: 'Read NPTEL Material', d: '30 min minimum', s: false, n: 25 }
    ],
    other: []
  },
  habitHeatmap: {
    weeks: ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4'],
    columns: ['Med AM', 'Med PM', 'Water', 'PT', 'Breathing', 'Pressure', 'Skin', 'Study', 'Mental', 'Mindful', 'Meals'],
    data: [
      [1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1],
      [1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    ]
  },
  courses: [
    {
      id: 1,
      title: 'Software Engineering',
      code: 'CSL2060',
      professor: 'Prof. Rajiv Kumar',
      credits: 4,
      year: 'B.Tech 2nd Year',
      progress: 78,
      grade: 'A',
      attendance: 88,
      status: 'Active',
      tags: ['Next: Mar 5', 'SRS Project'],
      icon: 'SE'
    },
    {
      id: 2,
      title: 'Data Structures & Algorithms',
      code: 'CSL2030',
      professor: 'Prof. Anita Singh',
      credits: 4,
      year: 'B.Tech 2nd Year',
      progress: 65,
      grade: 'B+',
      attendance: 82,
      status: 'In Progress',
      tags: ['Next: Mar 3', 'Trees & Graphs'],
      icon: 'DS'
    },
    {
      id: 3,
      title: 'Probability & Statistics',
      code: 'MAL2010',
      professor: 'Prof. Ranjit Das',
      credits: 3,
      year: 'B.Tech 2nd Year',
      progress: 90,
      grade: 'A+',
      attendance: 95,
      status: 'Near Complete',
      tags: ['Final: Mar 20', 'Strong'],
      icon: 'PS'
    }
  ],
  assignments: [
    {
      id: 'asg-1',
      title: 'SRS v2.0 Document',
      courseCode: 'CSL2060',
      dueDate: '2026-03-10',
      completed: false,
      createdAt: '2026-03-05T09:00:00.000Z',
      completedAt: null
    },
    {
      id: 'asg-2',
      title: 'Algorithm Analysis',
      courseCode: 'CSL2030',
      dueDate: '2026-03-08',
      completed: true,
      createdAt: '2026-03-04T11:30:00.000Z',
      completedAt: '2026-03-07T16:20:00.000Z'
    }
  ],
  assignmentActivity: [
    {
      id: 'act-1',
      message: 'Added assignment: SRS v2.0 Document',
      at: '2026-03-05T09:00:00.000Z'
    },
    {
      id: 'act-2',
      message: 'Completed assignment: Algorithm Analysis',
      at: '2026-03-07T16:20:00.000Z'
    }
  ],
  medicalRecords: [
    { id: 1, name: 'MRI Report - L2 Vertebrae', type: 'pdf', date: '2025-12-10' },
    { id: 2, name: 'X-Ray Post Surgery', type: 'img', date: '2025-12-18' },
    { id: 3, name: 'Physiotherapy Prescription', type: 'doc', date: '2026-01-05' },
    { id: 4, name: 'Discharge Summary', type: 'pdf', date: '2025-12-20' }
  ],
  physio: {
    exercises: [
      { id: 'ex-1', name: 'Leg Strengthening', time: '08:00 AM', details: '3 x 12 reps | Resistance band', done: true },
      { id: 'ex-2', name: 'Core Stability Circuit', time: '12:30 PM', details: 'Plank 30s x 3 | Bridge 15 x 3', done: true },
      { id: 'ex-3', name: 'Upper Body Stretch', time: '06:00 PM', details: '20 min flexibility routine', done: false }
    ],
    weeklyLog: { mon: 2, tue: 2, wed: 1, thu: 3, fri: 2, sat: 3, sun: 1 },
    weekHistory: [11, 13, 12],
    activeWeek: '2026-W11'
  },
  theme: 'light',
  feedback: { rating: 0, category: 'general', type: 'positive', anonymous: false, submissions: [] }
};

export const store = new Store(initialState);
