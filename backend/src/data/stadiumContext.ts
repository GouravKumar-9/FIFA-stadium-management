export const STADIUM_CONTEXT = {
  stadiumName: "MetLife Stadium (East Rutherford, NJ) - Host Venue for FIFA World Cup 2026",
  generalInfo: {
    address: "1 MetLife Stadium Dr, East Rutherford, NJ 07073",
    capacity: 82500,
    matches: [
      { id: "M1", date: "2026-06-15", time: "18:00", teamA: "USA", teamB: "Spain", type: "Group Stage", attendanceForecast: 80000 },
      { id: "M2", date: "2026-06-20", time: "20:00", teamA: "Mexico", teamB: "Germany", type: "Group Stage", attendanceForecast: 81500 },
      { id: "M3", date: "2026-06-26", time: "19:00", teamA: "Argentina", teamB: "France", type: "Round of 16", attendanceForecast: 82000 },
      { id: "M4", date: "2026-07-19", time: "20:00", teamA: "Winner SF1", teamB: "Winner SF2", type: "Final Match", attendanceForecast: 82500 }
    ],
    rules: [
      "Bag Policy: Only clear bags (plastic, vinyl, or PVC) not exceeding 12x6x12 inches are permitted.",
      "Prohibited Items: Weapons of any kind, alcohol, flags/banners larger than 3x5 feet, professional cameras, and drones.",
      "Smoking: Smoking (including e-cigarettes) is strictly prohibited anywhere inside the stadium boundary.",
      "Gates Open: Gates open 3 hours prior to kickoff. Fans are highly encouraged to arrive early due to intense security screening."
    ]
  },
  gates: [
    {
      id: "GateA",
      name: "Gate A (MetLife Gate - North)",
      type: "General Entrance",
      accessibility: "Equipped with general ramps, elevators, and dedicated accessible ticket scanning lanes.",
      concourseConnection: "Connects directly to Section 101-110 (Lower Level) and the North Concourse.",
      amenities: ["Wheelchair pickup point", "Assistance Desk A", "Stroller Valet A"]
    },
    {
      id: "GateB",
      name: "Gate B (Verizon Gate - East)",
      type: "General & Accessible Entrance",
      accessibility: "Fully accessible. Zero-grade entry, close proximity to ADA parking Lot E, and elevators directly to Upper Concourse.",
      concourseConnection: "Connects directly to Section 111-120 (Lower Level) and East Concourse.",
      amenities: ["ADA Assistance Desk B", "Assistive Listening Device distribution", "Sensory Room access point"]
    },
    {
      id: "GateC",
      name: "Gate C (Hess Gate - South)",
      type: "General Entrance",
      accessibility: "Equipped with accessible entry lanes. Multi-level ramp system connects to Lower/Mid Concourse.",
      concourseConnection: "Connects directly to Section 121-130 (Lower Level) and South Concourse.",
      amenities: ["Wheelchair assistance team", "Stroller Valet C"]
    },
    {
      id: "GateD",
      name: "Gate D (Bud Light Gate - West)",
      type: "General & VIP Entrance",
      accessibility: "Accessible entry lanes, direct escalator and elevator access to VIP suites and Upper Levels.",
      concourseConnection: "Connects directly to Section 131-140 (Lower Level) and West Concourse.",
      amenities: ["VIP Assistance Desk D", "Wheelchair pickup point"]
    }
  ],
  sections: [
    { id: "101-110", name: "Sections 101 to 110", gate: "GateA", stairsCode: "ST-A", rampCode: "RM-A", elevatorCode: "EL-A" },
    { id: "111-120", name: "Sections 111 to 120", gate: "GateB", stairsCode: "ST-B", rampCode: "RM-B", elevatorCode: "EL-B" },
    { id: "121-130", name: "Sections 121 to 130", gate: "GateC", stairsCode: "ST-C", rampCode: "RM-C", elevatorCode: "EL-C" },
    { id: "131-140", name: "Sections 131 to 140", gate: "GateD", stairsCode: "ST-D", rampCode: "RM-D", elevatorCode: "EL-D" }
  ],
  transit: [
    {
      mode: "metro",
      name: "Meadowlands Rail Station (NJ Transit)",
      co2SavedKg: 4.8,
      timeMins: 25,
      co2EmittedKg: 0.5,
      costUsd: 5.50,
      details: "Direct train service from Secaucus Junction to Meadowlands Station. Departs every 10 mins before/after matches. Highly recommended, fully accessible."
    },
    {
      mode: "shuttle",
      name: "FIFA Express Shuttle Bus",
      co2SavedKg: 3.2,
      timeMins: 35,
      co2EmittedKg: 2.1,
      costUsd: 3.00,
      details: "Park-and-ride shuttle busses from various hotels and park lots in East Rutherford. Fully accessible, utilizes dedicated transit lanes."
    },
    {
      mode: "rideshare",
      name: "Uber/Lyft Designated Drop-off Zone (Lot K)",
      co2SavedKg: 0.0,
      timeMins: 45,
      co2EmittedKg: 5.3,
      costUsd: 22.00,
      details: "Designated rideshare zone in Lot K. Expect heavy traffic delays and surge pricing. ADA accessible drop-off at Lot E is available upon request."
    },
    {
      mode: "walk",
      name: "Pedestrian Walkway (from local hotels)",
      co2SavedKg: 5.3,
      timeMins: 20,
      co2EmittedKg: 0.0,
      costUsd: 0.00,
      details: "Well-lit and security-monitored walking paths connecting neighboring hotels directly to Gate A. Stroller and wheelchair friendly with zero steps."
    },
    {
      mode: "driving",
      name: "Personal Vehicle (General Parking Lot P)",
      co2SavedKg: -1.0,
      timeMins: 50,
      co2EmittedKg: 5.3,
      costUsd: 40.00,
      details: "Self-driving and parking in Lot P. Heavy egress congestion after matches. High emissions."
    }
  ]
};
