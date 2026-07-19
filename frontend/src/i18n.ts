import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      appName: "StadiumSense AI",
      tagline: "FIFA World Cup 2026 Operations & Experience Copilot",
      navOverview: "Overview",
      navConcierge: "AI Concierge",
      navNavigation: "Smart Wayfinding",
      navCrowd: "Crowd Analytics",
      navOps: "Ops Copilot",
      navSustainability: "Sustainability",
      roleSelect: "Current View Role:",
      roleFan: "Fan / Visitor",
      roleVolunteer: "Volunteer / Staff",
      roleOrganizer: "Match Organizer",
      langSelect: "Language",
      activeMatch: "Active Match Day"
    }
  },
  es: {
    translation: {
      appName: "StadiumSense AI",
      tagline: "Copiloto de Operaciones y Experiencia de la Copa Mundial de la FIFA 2026",
      navOverview: "Resumen",
      navConcierge: "Asistente AI",
      navNavigation: "Rutas Inteligentes",
      navCrowd: "Control de Multitudes",
      navOps: "Centro de Control",
      navSustainability: "Sostenibilidad",
      roleSelect: "Rol de Vista:",
      roleFan: "Aficionado / Visitante",
      roleVolunteer: "Voluntario / Personal",
      roleOrganizer: "Organizador del Partido",
      langSelect: "Idioma",
      activeMatch: "Día de Partido Activo"
    }
  },
  fr: {
    translation: {
      appName: "StadiumSense AI",
      tagline: "Copilote des Opérations et de l'Expérience de la Coupe du Monde de la FIFA 2026",
      navOverview: "Aperçu",
      navConcierge: "Concierge IA",
      navNavigation: "Navigation Intelligente",
      navCrowd: "Gestion des Foules",
      navOps: "Copilote Ops",
      navSustainability: "Durabilité",
      roleSelect: "Rôle de l'affichage:",
      roleFan: "Supporter / Visiteur",
      roleVolunteer: "Bénévole / Staff",
      roleOrganizer: "Organisateur de Match",
      langSelect: "Langue",
      activeMatch: "Jour de Match Actif"
    }
  },
  ar: {
    translation: {
      appName: "StadiumSense AI",
      tagline: "مساعد العمليات والخبرة لكأس العالم فيفا 2026",
      navOverview: "نظرة عامة",
      navConcierge: "المساعد الذكي",
      navNavigation: "تحديد المسار الذكي",
      navCrowd: "تحليل الحشود",
      navOps: "مساعد العمليات",
      navSustainability: "الاستدامة البيئية",
      roleSelect: "دور العرض الحالي:",
      roleFan: "مشجع / زائر",
      roleVolunteer: "متطوع / موظف",
      roleOrganizer: "منظم المباراة",
      langSelect: "اللغة",
      activeMatch: "يوم المباراة النشط"
    }
  },
  hi: {
    translation: {
      appName: "StadiumSense AI",
      tagline: "फीफा विश्व कप 2026 ऑपरेशन्स एवं अनुभव कोपायलट",
      navOverview: "सिंहावलोकन",
      navConcierge: "एआई द्वारपाल",
      navNavigation: "स्मार्ट नेविगेशन",
      navCrowd: "भीड़ प्रबंधन",
      navOps: "ऑप्स कोपायलट",
      navSustainability: "पर्यावरण अनुकूल",
      roleSelect: "भूमिका चयन:",
      roleFan: "प्रशंसक / आगंतुक",
      roleVolunteer: "स्वयंसेवक / स्टाफ",
      roleOrganizer: "मैच आयोजक",
      langSelect: "भाषा",
      activeMatch: "सक्रिय मैच का दिन"
    }
  },
  pt: {
    translation: {
      appName: "StadiumSense AI",
      tagline: "Copiloto de Operações e Experiência da Copa do Mundo FIFA 2026",
      navOverview: "Visão Geral",
      navConcierge: "Concierge de IA",
      navNavigation: "Rotas Inteligentes",
      navCrowd: "Controle de Público",
      navOps: "Copiloto Ops",
      navSustainability: "Sustentabilidade",
      roleSelect: "Função de Visualização:",
      roleFan: "Torcedor / Visitante",
      roleVolunteer: "Voluntário / Equipe",
      roleOrganizer: "Organizador da Partida",
      langSelect: "Idioma",
      activeMatch: "Dia de Jogo Ativo"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "en",
    fallbackLng: "en",
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
