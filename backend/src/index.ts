import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Load environment variables
dotenv.config();

import { STADIUM_CONTEXT } from './data/stadiumContext.js';
import {
  askConcierge,
  generateCrowdBriefing,
  analyzeIncident,
  generateMultilingualAnnouncement,
  generateSustainabilityTips
} from './llmClient.js';
import {
  apiRateLimiter,
  genAiRateLimiter,
  authorizeRole,
  validateBody,
  chatRequestSchema,
  navigationRouteSchema,
  incidentReportSchema,
  announcementSchema,
  sustainabilityRequestSchema,
  errorHandler,
  AuthenticatedRequest
} from './middleware/security.js';
import type { SensorData, IncidentReport, RouteStep } from './shared-types.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Security Base: Enable Helmet headers and CORS
app.use(helmet());
app.use(cors({
  origin: '*', // Allow any origin for demo purposes
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Apply global rate limiting to all requests
app.use('/api', apiRateLimiter);

// -------------------------------------------------------------
// IN-MEMORY SIMULATED DATABASE STATE
// -------------------------------------------------------------
let sensorMetrics: SensorData[] = [
  { gateId: "GateA", gateName: "Gate A (MetLife)", currentCount: 15400, capacity: 20000, densityPercent: 77, status: 'warning', trend: 'up' },
  { gateId: "GateB", gateName: "Gate B (Verizon)", currentCount: 17200, capacity: 20000, densityPercent: 86, status: 'critical', trend: 'up' },
  { gateId: "GateC", gateName: "Gate C (Hess)", currentCount: 9800, capacity: 20000, densityPercent: 49, status: 'normal', trend: 'down' },
  { gateId: "GateD", gateName: "Gate D (Bud Light)", currentCount: 12100, capacity: 20000, densityPercent: 60, status: 'normal', trend: 'stable' }
];

let activeIncidents: IncidentReport[] = [
  {
    id: "INC-101",
    description: "Minor water spill near food court entrance in Section 112. Floor is slippery.",
    category: "facilities",
    severity: "low",
    status: "open",
    timestamp: Date.now() - 1000 * 60 * 15, // 15 mins ago
    suggestedAction: "Dispatch custodial team with warning sign.",
    location: "Section 112 Food Court"
  }
];

let activeActions: {
  id: string;
  action: string;
  targetGate: string;
  status: 'pending' | 'approved' | 'dismissed';
}[] = [
  { id: "ACT-01", action: "Open auxiliary overflow gate B2 to relieve Verizon entrance.", targetGate: "GateB", status: "pending" },
  { id: "ACT-02", action: "Reroute incoming shuttle buses from North lot directly to Gate C.", targetGate: "GateB", status: "pending" }
];

// Helper to update sensor data randomly to simulate live feeds
function simulateLiveSensors() {
  sensorMetrics = sensorMetrics.map(m => {
    let delta = Math.floor(Math.random() * 400) - 150; // shift counts
    const nextCount = Math.max(1000, Math.min(m.capacity, m.currentCount + delta));
    const density = Math.round((nextCount / m.capacity) * 100);
    let status: 'normal' | 'warning' | 'critical' = 'normal';
    if (density > 80) status = 'critical';
    else if (density > 70) status = 'warning';
    
    const trend = delta > 100 ? 'up' as const : (delta < -100 ? 'down' as const : 'stable' as const);

    return {
      ...m,
      currentCount: nextCount,
      densityPercent: density,
      status,
      trend
    };
  });
}

// -------------------------------------------------------------
// MODULE A: MULTILINGUAL AI CONCIERGE
// -------------------------------------------------------------
app.post('/api/chat', genAiRateLimiter, validateBody(chatRequestSchema), async (req, res, next) => {
  try {
    const { message, history, language } = req.body;
    const chatResult = await askConcierge(message, history, language);
    res.json(chatResult);
  } catch (error) {
    next(error);
  }
});

// -------------------------------------------------------------
// MODULE B: SMART NAVIGATION & ROUTING
// -------------------------------------------------------------
app.post('/api/navigation/route', validateBody(navigationRouteSchema), (req, res, next) => {
  try {
    const { startLocation, destination, persona } = req.body;

    // Simple deterministic wayfinding builder based on persona parameters
    const steps: RouteStep[] = [];
    let svgPath = "";
    let durationMins = 12;
    let distanceMeters = 450;

    // Resolve gate and section details
    const matchedGate = STADIUM_CONTEXT.gates.find(g => g.id === startLocation || g.name.includes(startLocation));
    const gateName = matchedGate ? matchedGate.name : startLocation;
    
    steps.push({
      instruction: `Enter via ${gateName} and pass security scan.`,
      accessible: true,
      type: 'gate'
    });

    if (persona === 'wheelchair' || persona === 'stroller') {
      steps.push({
        instruction: `Follow the ground-level ramp indicators directly toward elevator tower ${startLocation === 'GateB' ? 'EL-B' : 'EL-A'}.`,
        accessible: true,
        type: 'ramp'
      });
      steps.push({
        instruction: `Take Elevator to Concourse Level 2. Elevators are wide and equipped with tactile braille buttons.`,
        accessible: true,
        type: 'elevator'
      });
      steps.push({
        instruction: `Exit elevator and head left along the flat step-free concourse path towards target section.`,
        accessible: true,
        type: 'general'
      });
      steps.push({
        instruction: `Access seating platform via Section ADA entry ramp. Security stewards are on standby to assist.`,
        accessible: true,
        type: 'seating'
      });
      
      // Accessible route stats (longer path, but completely barrier-free)
      durationMins = 16;
      distanceMeters = 550;
      svgPath = "M 50,50 L 150,50 L 150,150 L 250,150"; // wheelchair path coordinates
    } else {
      // General/Visual persona path
      if (persona === 'visual') {
        steps.push({
          instruction: `Turn right past the ticket terminal. Follow the tactile paving grid on the floor for 50 meters.`,
          accessible: true,
          type: 'general'
        });
        steps.push({
          instruction: `Climb Stairs ST-A (12 steps, handrails on both sides) to Section 100 level. Audio beacons emit tone markers at landing.`,
          accessible: false,
          type: 'stairs'
        });
        steps.push({
          instruction: `Turn left. Section entrance is 15 meters ahead. Guided floor strips lead to seat row.`,
          accessible: true,
          type: 'seating'
        });
        durationMins = 14;
        distanceMeters = 400;
      } else {
        // General Fan Route
        steps.push({
          instruction: `Proceed up Main Concourse Stairs directly inside security.`,
          accessible: false,
          type: 'stairs'
        });
        steps.push({
          instruction: `Walk past concession stands towards Section seating entrance.`,
          accessible: true,
          type: 'general'
        });
        steps.push({
          instruction: `Walk down seating aisle stairs to your row.`,
          accessible: false,
          type: 'seating'
        });
        durationMins = 10;
        distanceMeters = 380;
      }
      svgPath = "M 50,50 L 120,80 L 250,150"; // standard path coordinates
    }

    res.json({
      steps,
      accessible: persona === 'wheelchair' || persona === 'stroller',
      durationMins,
      distanceMeters,
      svgPath,
      startLocation,
      destination,
      persona
    });
  } catch (error) {
    next(error);
  }
});

// -------------------------------------------------------------
// MODULE C: CROWD INTELLIGENCE DASHBOARD
// -------------------------------------------------------------
// Public read endpoint for dashboard layout
app.get('/api/crowd/status', (req, res) => {
  simulateLiveSensors();
  res.json({
    metrics: sensorMetrics,
    recommendedActions: activeActions
  });
});

// Secured: Requires organizer authentication
app.post('/api/crowd/briefing', authorizeRole(['organizer']), async (req, res, next) => {
  try {
    const briefingText = await generateCrowdBriefing(sensorMetrics);
    
    // Determine overall alert based on metrics
    const highestDensity = Math.max(...sensorMetrics.map(m => m.densityPercent));
    let alertLevel: 'info' | 'warning' | 'danger' = 'info';
    if (highestDensity > 85) alertLevel = 'danger';
    else if (highestDensity > 70) alertLevel = 'warning';

    res.json({
      timestamp: Date.now(),
      briefingText,
      alertLevel,
      recommendedActions: activeActions
    });
  } catch (error) {
    next(error);
  }
});

// Secured: Process a human-in-the-loop operational response
app.post('/api/crowd/action', authorizeRole(['organizer']), (req, res, next) => {
  try {
    const { actionId, status } = req.body;
    if (!actionId || !['approved', 'dismissed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid payload: actionId and status (approved/dismissed) required' });
    }

    activeActions = activeActions.map(a => 
      a.id === actionId ? { ...a, status: status as 'approved' | 'dismissed' } : a
    );

    res.json({ success: true, actions: activeActions });
  } catch (error) {
    next(error);
  }
});

// -------------------------------------------------------------
// MODULE D: VOLUNTEER & STAFF OPS COPILOT
// -------------------------------------------------------------
// Secured: Requires volunteer or organizer credentials
app.get('/api/incidents', authorizeRole(['volunteer', 'organizer']), (req, res) => {
  res.json({ incidents: activeIncidents });
});

// Secured: Intake new incident
app.post('/api/incidents', authorizeRole(['volunteer', 'organizer']), validateBody(incidentReportSchema), async (req, res, next) => {
  try {
    const { description, location } = req.body;
    
    // GenAI structures the raw incident report details
    const analysis = await analyzeIncident(description, location);

    const newIncident: IncidentReport = {
      id: `INC-${Math.floor(100 + Math.random() * 900)}`,
      description,
      location,
      category: analysis.category,
      severity: analysis.severity,
      status: 'open',
      suggestedAction: analysis.suggestedAction,
      timestamp: Date.now()
    };

    activeIncidents.unshift(newIncident);
    res.status(201).json(newIncident);
  } catch (error) {
    next(error);
  }
});

// Secured: Draft and translate multilingual crowd announcements
app.post('/api/incidents/announcement', authorizeRole(['volunteer', 'organizer']), validateBody(announcementSchema), async (req: AuthenticatedRequest, res, next) => {
  try {
    const { title, message } = req.body;
    const translations = await generateMultilingualAnnouncement(title, message);
    res.json({
      title,
      translations
    });
  } catch (error) {
    next(error);
  }
});

// -------------------------------------------------------------
// MODULE E: SUSTAINABILITY & RESOURCE ADVISOR
// -------------------------------------------------------------
// Public carbon-transport routing
app.post('/api/sustainability/recommend', validateBody(sustainabilityRequestSchema), (req, res, next) => {
  try {
    const { startPoint, matchId } = req.body;
    
    // Find matching details
    const matchedMatch = STADIUM_CONTEXT.generalInfo.matches.find(m => m.id === matchId) || STADIUM_CONTEXT.generalInfo.matches[0];
    
    // Enrich transit suggestions
    const enrichedTransit = STADIUM_CONTEXT.transit.map(t => {
      let durationAdjust = 0;
      // Add slight delay for peak match times
      if (matchedMatch.time === "20:00") durationAdjust = 5;
      return {
        ...t,
        timeMins: t.timeMins + durationAdjust,
        details: `${t.details} Recommended arrival is ${matchedMatch.time} kickoff.`
      };
    });

    res.json({
      matchDetails: matchedMatch,
      startPoint,
      options: enrichedTransit
    });
  } catch (error) {
    next(error);
  }
});

// Secured: Organizer-only resources consumption predictions & GenAI advisory
app.get('/api/sustainability/metrics', authorizeRole(['organizer']), async (req, res, next) => {
  try {
    // Forecast resource loading based on upcoming match attendance
    const upcomingMatch = STADIUM_CONTEXT.generalInfo.matches[0];
    const attendance = upcomingMatch.attendanceForecast;

    // Mathematical load equations
    const predictedEnergyMwh = Math.round((attendance * 0.00015) * 100) / 100; // ~12 MWh for 80k fans
    const predictedWasteTons = Math.round((attendance * 0.0012) * 100) / 100; // ~96 tons waste
    const carbonFootprintKg = Math.round(attendance * 1.85); // average transport/vendor emission index

    const metrics = {
      predictedEnergyMwh,
      predictedWasteTons,
      carbonFootprintKg
    };

    const aiRecommendations = await generateSustainabilityTips(attendance, metrics);

    res.json({
      attendanceForecast: attendance,
      predictedEnergyMwh,
      predictedWasteTons,
      carbonFootprintKg,
      aiRecommendations,
      timestamp: Date.now()
    });
  } catch (error) {
    next(error);
  }
});

// -------------------------------------------------------------
// STATIC FILES & SPA ROUTING FOR PRODUCTION DEPLOYMENT
// -------------------------------------------------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDistPath = path.join(__dirname, '../../frontend/dist');

if (fs.existsSync(frontendDistPath)) {
  console.log(`[StadiumSense Backend] Serving static frontend files from: ${frontendDistPath}`);
  app.use(express.static(frontendDistPath));
  
  // Wildcard fallback: Serve index.html for Single-Page App (SPA) routes
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
} else {
  console.log(`[StadiumSense Backend] Frontend build folder not found at: ${frontendDistPath}. Serving API routes only.`);
}

// -------------------------------------------------------------
// ERROR HANDLER & LAUNCH
// -------------------------------------------------------------
app.use(errorHandler);

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`[StadiumSense Backend] Server is running on port ${PORT} in ${process.env.NODE_ENV} mode.`);
  });
}

export default app;
