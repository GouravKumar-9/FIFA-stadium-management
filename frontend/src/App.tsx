import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './i18n'; // initialize i18n
import {
  LayoutDashboard,
  MessageSquareCode,
  Map,
  Activity,
  Shield,
  Leaf,
  User,
  Globe,
  Settings
} from 'lucide-react';

import Overview from './pages/Overview';
import Concierge from './pages/Concierge';
import Navigation from './pages/Navigation';
import CrowdIntelligence from './pages/CrowdIntelligence';
import OpsCopilot from './pages/OpsCopilot';
import Sustainability from './pages/Sustainability';

export default function App() {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState<'overview' | 'concierge' | 'navigation' | 'crowd' | 'ops' | 'sustainability'>('overview');
  const [role, setRole] = useState<'fan' | 'volunteer' | 'organizer'>('fan');
  const [currentLang, setCurrentLang] = useState('en');

  // Token mapping based on the selected role to showcase the security boundaries
  const token = role === 'organizer' ? 'admin-token' : (role === 'volunteer' ? 'volunteer-token' : 'fan-token');

  // Sync lang select with HTML lang attribute (A11y/WCAG)
  useEffect(() => {
    document.documentElement.lang = currentLang;
    i18n.changeLanguage(currentLang);
  }, [currentLang, i18n]);

  const navigationItems = [
    { id: 'overview' as const, label: t('navOverview'), icon: LayoutDashboard },
    { id: 'concierge' as const, label: t('navConcierge'), icon: MessageSquareCode },
    { id: 'navigation' as const, label: t('navNavigation'), icon: Map },
    { id: 'crowd' as const, label: t('navCrowd'), icon: Activity, badge: role !== 'organizer' ? 'Locked' : undefined },
    { id: 'ops' as const, label: t('navOps'), icon: Shield, badge: role === 'fan' ? 'Locked' : undefined },
    { id: 'sustainability' as const, label: t('navSustainability'), icon: Leaf }
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row font-sans text-gray-100 bg-gray-950/20">
      
      {/* Sidebar Navigation */}
      <nav 
        className="w-full md:w-64 bg-gray-900 border-b md:border-b-0 md:border-r border-gray-850 flex flex-col flex-shrink-0 z-20"
        aria-label="Primary platform navigation"
      >
        <div className="p-5 border-b border-gray-850 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-extrabold text-white text-sm shadow-lg shadow-blue-500/20">
              S
            </div>
            <div>
              <h2 className="text-sm font-black tracking-wider text-white uppercase">{t('appName')}</h2>
              <span className="text-[8px] font-bold text-gray-500 tracking-widest uppercase">FIFA 2026</span>
            </div>
          </div>
        </div>

        {/* Navigation links */}
        <ul className="flex-1 p-4 space-y-1">
          {navigationItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-lg text-xs font-semibold tracking-wide transition-all border ${
                    isActive 
                      ? 'bg-blue-600 border-blue-500 text-white font-bold' 
                      : 'bg-transparent border-transparent text-gray-400 hover:bg-gray-800/50 hover:text-white'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[8px] bg-red-950/20 border border-red-500/30 text-red-400 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider scale-90">
                      {item.badge}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>

        {/* Footer/Settings sidebar section */}
        <div className="p-4 border-t border-gray-850 bg-gray-950/40 text-xs text-gray-500">
          <div className="flex items-center justify-between">
            <span>StadiumSense AI v1.0.0</span>
            <Settings className="w-3.5 h-3.5 hover:text-white cursor-pointer" />
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header Navbar */}
        <header className="h-16 border-b border-gray-850 bg-gray-900/80 backdrop-blur flex justify-between items-center px-6 z-10">
          {/* Left spacer or responsive breadcrumb */}
          <div className="hidden sm:block text-xs font-bold text-gray-500 uppercase tracking-widest">
            MetLife Stadium Command
          </div>

          {/* Right utility options */}
          <div className="flex items-center gap-4 ml-auto">
            {/* View Role Switcher (Simulating Auth roles) */}
            <div className="flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-gray-400 hidden xs:block" />
              <label htmlFor="roleSwitcher" className="text-[10px] uppercase font-bold text-gray-400 hidden sm:block">
                {t('roleSelect')}
              </label>
              <select
                id="roleSwitcher"
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="bg-gray-950 border border-gray-850 rounded px-2 py-1 text-xs text-white font-semibold focus:outline-none focus:border-blue-500 cursor-pointer"
                aria-label="User role switcher selector"
              >
                <option value="fan">{t('roleFan')}</option>
                <option value="volunteer">{t('roleVolunteer')}</option>
                <option value="organizer">{t('roleOrganizer')}</option>
              </select>
            </div>

            {/* Language Selector */}
            <div className="flex items-center gap-2">
              <Globe className="w-3.5 h-3.5 text-gray-400 hidden xs:block" />
              <label htmlFor="langSwitcher" className="text-[10px] uppercase font-bold text-gray-400 hidden sm:block">
                {t('langSelect')}
              </label>
              <select
                id="langSwitcher"
                value={currentLang}
                onChange={(e) => setCurrentLang(e.target.value)}
                className="bg-gray-950 border border-gray-850 rounded px-2 py-1 text-xs text-white font-semibold focus:outline-none focus:border-blue-500 cursor-pointer"
                aria-label="Language selector"
              >
                <option value="en">English (US)</option>
                <option value="es">Español (MX)</option>
                <option value="fr">Français (CA)</option>
                <option value="ar">العربية (Arabic)</option>
                <option value="hi">हिन्दी (Hindi)</option>
                <option value="pt">Português (BR)</option>
              </select>
            </div>
          </div>
        </header>

        {/* Tab rendering window */}
        <main className="flex-1 p-6 overflow-y-auto" id="main-content-window" tabIndex={-1}>
          {activeTab === 'overview' && <Overview role={role} token={token} />}
          {activeTab === 'concierge' && <Concierge currentLang={currentLang} onLanguageChange={setCurrentLang} />}
          {activeTab === 'navigation' && <Navigation />}
          {activeTab === 'crowd' && <CrowdIntelligence role={role} token={token} />}
          {activeTab === 'ops' && <OpsCopilot role={role} token={token} />}
          {activeTab === 'sustainability' && <Sustainability role={role} token={token} />}
        </main>
      </div>
    </div>
  );
}
