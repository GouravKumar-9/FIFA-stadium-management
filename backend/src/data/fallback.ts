export const FALLBACK_RESPONSES: Record<string, string> = {
  // Common FAQs mapping keys/keywords
  bag_policy: "Bag Policy Citation: Only clear plastic, vinyl, or PVC bags not exceeding 12x6x12 inches are permitted inside the stadium. Non-compliant bags must be returned to vehicles or stored in the locker trucks outside the gate.",
  prohibited_items: "Prohibited Items: Weapons of any kind, alcohol, flags/banners larger than 3x5 feet, professional video equipment, and drones are strictly prohibited. Safe travel and safety checks are in effect at all gates.",
  accessibility: "Accessibility features: MetLife Stadium is fully WCAG compliant and ADA accessible. All gates (A, B, C, D) have accessible entry lanes. Gate B provides direct elevators to the upper levels and a sensory room located near Section 118.",
  food_beverage: "Concessions & Water: Bottled water (unopened, plastic, 20oz or less) is permitted. Free water refill stations are located near Sections 104, 117, 128, and 142.",
  match_schedule: "Match Fixtures: Next upcoming matches are:\n- June 15: USA vs Spain (Group Stage)\n- June 20: Mexico vs Germany (Group Stage)\n- June 26: Argentina vs France (Round of 16)\n- July 19: FIFA World Cup 2026 Final Match",
  general: "Welcome to StadiumSense AI. I can help you with wayfinding, accessibility navigation, match schedules, facility policies, and public transportation. How can I assist you today?"
};

export function getFallbackChat(query: string, language: string): string {
  const q = query.toLowerCase();
  let baseResponse = FALLBACK_RESPONSES.general;
  
  if (q.includes("bag") || q.includes("clear") || q.includes("purse")) {
    baseResponse = FALLBACK_RESPONSES.bag_policy;
  } else if (q.includes("prohibit") || q.includes("ban") || q.includes("bring") || q.includes("weapon") || q.includes("camera")) {
    baseResponse = FALLBACK_RESPONSES.prohibited_items;
  } else if (q.includes("wheelchair") || q.includes("access") || q.includes("ada") || q.includes("elevator") || q.includes("sensory") || q.includes("disab")) {
    baseResponse = FALLBACK_RESPONSES.accessibility;
  } else if (q.includes("schedule") || q.includes("match") || q.includes("game") || q.includes("ticket") || q.includes("date")) {
    baseResponse = FALLBACK_RESPONSES.match_schedule;
  } else if (q.includes("food") || q.includes("drink") || q.includes("water") || q.includes("eat")) {
    baseResponse = FALLBACK_RESPONSES.food_beverage;
  }

  // Simple translate simulation for fallback (supports English, Spanish, French, Arabic, Hindi, Portuguese)
  if (language === "es") {
    if (baseResponse === FALLBACK_RESPONSES.bag_policy) return "[Traducido del Inglés] Política de Bolsas: Solo se permiten bolsas de plástico transparente, vinilo o PVC que no excedan las 12x6x12 pulgadas.";
    if (baseResponse === FALLBACK_RESPONSES.accessibility) return "[Traducido del Inglés] MetLife Stadium es totalmente accesible. La Puerta B ofrece ascensores directos y una sala sensorial cerca de la Sección 118.";
    return `[Traducido del Inglés] Hola, soy StadiumSense AI. Puedo ayudarle con la navegación en el estadio, transporte y preguntas.`;
  }
  if (language === "fr") {
    if (baseResponse === FALLBACK_RESPONSES.bag_policy) return "[Traduit de l'anglais] Politique des sacs: Seuls les sacs en plastique transparent, vinyle ou PVC ne dépassant pas 12x6x12 pouces sont autorisés.";
    return `[Traduit de l'anglais] Bonjour, je suis StadiumSense AI. Je peux vous aider pour l'orientation et l'accessibilité.`;
  }
  if (language === "hi") {
    if (baseResponse === FALLBACK_RESPONSES.bag_policy) return "[अंग्रेजी से अनुवादित] बैग नीति: केवल स्पष्ट प्लास्टिक, विनाइल या पीवीसी बैग जिनकी माप 12x6x12 इंच से अधिक न हो, की अनुमति है।";
    return `[अंग्रेजी से अनुवादित] स्टेडियमसेंस एआई में आपका स्वागत है। मैं आपकी सहायता कर सकता हूँ।`;
  }
  if (language === "ar") {
    if (baseResponse === FALLBACK_RESPONSES.bag_policy) return "[مترجم من الإنجليزية] سياسة الحقائب: يُسمح فقط بالحقائب البلاستيكية الشفافة أو الفينيل أو PVC التي لا يتجاوز حجمها 12x6x12 بوصة.";
    return `[مترجم من الإنجليزية] مرحبًا بك في StadiumSense AI. كيف يمكنني مساعدتك اليوم؟`;
  }
  if (language === "pt") {
    if (baseResponse === FALLBACK_RESPONSES.bag_policy) return "[Traduzido do Inglês] Política de Bolsas: Apenas bolsas de plástico transparente, vinil ou PVC não excedendo 12x6x12 polegadas são permitidas.";
    return `[Traduzido do Inglês] Olá, sou o StadiumSense AI. Como posso ajudar você hoje?`;
  }

  return baseResponse;
}

export function getFallbackCrowdBriefing(metrics: any[]): string {
  const highDensityGates = metrics.filter((m: any) => m.densityPercent > 80);
  if (highDensityGates.length > 0) {
    const gatesText = highDensityGates.map((g: any) => `${g.gateName} (${g.densityPercent}%)`).join(", ");
    return `CROWD SAFETY ALERT: High crowd density detected at ${gatesText}. Heavy chokepoints developing. Recommend opening adjacent overflow gates, activating visual signage to redirect incoming crowds to East/West gates, and deploying extra volunteer guides to direct fans to shorter queues.`;
  }
  return "STADIUM MONITORING: Overall crowd flows are operating within normal parameters. Entry rates at Gates A, B, C, and D are balanced. Concourse density is stable, and no immediate rerouting actions are required.";
}

export function getFallbackIncidentAnalysis(description: string): {
  category: 'facilities' | 'medical' | 'security' | 'crowd' | 'other';
  severity: 'low' | 'medium' | 'high';
  suggestedAction: string;
} {
  const d = description.toLowerCase();
  if (d.includes("slip") || d.includes("leak") || d.includes("water") || d.includes("broken") || d.includes("spill")) {
    return {
      category: "facilities",
      severity: d.includes("flood") || d.includes("slip") || d.includes("slipping") ? "medium" : "low",
      suggestedAction: "Dispatch environmental services team to clean up water spill and post warning cones immediately. Inspect pipeline for leaks."
    };
  }
  if (d.includes("hurt") || d.includes("faint") || d.includes("bleed") || d.includes("heart") || d.includes("medical") || d.includes("collapse")) {
    return {
      category: "medical",
      severity: "high",
      suggestedAction: "Deploy first-aid responder squad to specified section location. Prepare transport stretcher and notify nearest stadium medical station."
    };
  }
  if (d.includes("fight") || d.includes("stolen") || d.includes("theft") || d.includes("drunk") || d.includes("harass") || d.includes("weapon")) {
    return {
      category: "security",
      severity: "high",
      suggestedAction: "Alert field security team sector supervisor. Dispatch venue officers to contain situation and escort disruptive individuals out."
    };
  }
  if (d.includes("crowd") || d.includes("gate crush") || d.includes("congest") || d.includes("rush") || d.includes("stuck")) {
    return {
      category: "crowd",
      severity: d.includes("crush") ? "high" : "medium",
      suggestedAction: "Halt entry ticket scans temporarily at affected sector. Open auxiliary exits and dispatch stewards to spread the crowd outward."
    };
  }
  return {
    category: "other",
    severity: "low",
    suggestedAction: "Log ticket details and dispatch volunteer staff to investigate section area and report back."
  };
}

export function getFallbackAnnouncements(title: string, message: string): Record<string, string> {
  return {
    en: `[OFFICIAL ANNOUNCEMENT] ${title}: ${message}`,
    es: `[ANUNCIO OFICIAL] ${title} (Traducido): ${message} (Por favor, siga las instrucciones de los oficiales).`,
    fr: `[ANNONCE OFFICIELLE] ${title} (Traduit): ${message} (Veuillez suivre les instructions du personnel).`,
    ar: `[إعلان رسمي] ${title} (مترجم): ${message} (يرجى اتباع تعليمات طاقم العمل).`,
    hi: `[आधिकारिक घोषणा] ${title} (अनुवादित): ${message} (कृपया कर्मचारियों के निर्देशों का पालन करें)।`,
    pt: `[ANÚNCIO OFICIAL] ${title} (Traduzido): ${message} (Por favor, siga as instruções dos funcionários).`
  };
}

export function getFallbackSustainabilityTips(attendance: number): string[] {
  const baselineWaste = Math.round(attendance * 0.0015 * 10) / 10;
  const recommendations = [
    `Stagger concession gate opening times to reduce peak energy spikes by 12%.`,
    `Deploy additional 25 smart recycling sorting monitors near high-density food court zones.`,
    `Optimize venue LED brightness down to 80% during pre-game sunny intervals, saving ~1.2 MWh.`,
    `Enable automated energy-saver mode in VIP luxury suites until 1 hour prior to kickoff.`,
    `Encourage public rail transit via mobile app alerts, aiming to divert 5,000 driving fans and save ~20 tons CO2.`
  ];
  return recommendations;
}
