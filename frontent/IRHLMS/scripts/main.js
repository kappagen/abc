import { Router }             from '../utilities/router.js';
import { ThemeManager }       from '../utilities/theme.js';
import { store }              from '../utilities/store.js';
import { Sidebar }            from '../components/sidebar/sidebar.js';
import { Navbar }             from '../components/navbar/navbar.js';
import { NotificationPanel }  from '../components/notification-panel/notification-panel.js';
import { Modal }              from '../components/modal/modal.js';
import { DashboardPage }      from '../pages/dashboard/dashboard.js';
import { PhysioPage }         from '../pages/physio/physio.js';
import { LearningPage }       from '../pages/learning/learning.js';
import { HabitsPage }         from '../pages/habits/habits.js';
import { MedicalPage }        from '../pages/medical/medical.js';
import { TherapyPage }        from '../pages/therapy/therapy.js';
import { AchievementsPage }   from '../pages/achievements/achievements.js';
import { FeedbackPage }       from '../pages/feedback/feedback.js';
import { SettingsPage }       from '../pages/settings/settings.js';

const router = new Router();
const theme = new ThemeManager();
const notifPanel = new NotificationPanel();
const sidebar = new Sidebar({
  onNavigate: (pageId) => {
    router.go(pageId);
    notifPanel.onNavigate();
    pageHandlers[pageId]?.();
  }
});

const navbar = new Navbar({
  onThemeToggle: () => theme.toggle(),
  onSettingsClick: () => {
    router.go('settings');
    sidebar.setActive('settings');
    pageHandlers.settings?.();
  }
});

const pageHandlers = {
  dashboard: () => DashboardPage.init(store),
  physio: () => PhysioPage.init(store),
  learning: () => LearningPage.init(store),
  habits: () => HabitsPage.init(store, sidebar),
  medical: () => MedicalPage.init(store),
  therapy: () => TherapyPage.init(),
  achievements: () => AchievementsPage.init(store),
  feedback: () => FeedbackPage.init(store),
  settings: () => SettingsPage.init()
};

document.addEventListener('DOMContentLoaded', () => {
  // 1 - Theme
  theme.init();

  // 2 - Navbar
  navbar.init();

  // 3 - Notification panel
  notifPanel.init();

  // 4 - Modal
  Modal.init();

  // 5 - Sidebar
  sidebar.init();

  // 6 - Settings controls
  SettingsPage.init();

  // 7 - Fire animation keyframe injection
  const style = document.createElement('style');
  style.textContent = '@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}';
  document.head.appendChild(style);

  // 8 - Boot to dashboard
  router.go('dashboard');
  DashboardPage.init(store);
});
