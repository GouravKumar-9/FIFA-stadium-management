import React, { useState } from 'react';
import { Compass, Accessibility, MapPin, Eye, Route } from 'lucide-react';
import type { RouteStep } from '../../../shared/types.js';

export default function Navigation() {
  const [startGate, setStartGate] = useState('GateA');
  const [destSection, setDestSection] = useState('111-120');
  const [persona, setPersona] = useState<'general' | 'wheelchair' | 'visual' | 'stroller'>('general');
  const [route, setRoute] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerateRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/navigation/route', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startLocation: startGate,
          destination: destSection,
          persona
        })
      });

      if (!res.ok) throw new Error('Failed to generate route');
      const data = await res.json();
      setRoute(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Determine path points in SVG coordinate space based on start gate and destination section
  // SVG size is 300x300, center is (150, 150)
  const getSvgRoutePoints = () => {
    if (!route) return "";

    let points = "150,40"; // Gate A (North)
    if (startGate === 'GateB') points = "260,150"; // Gate B (East)
    if (startGate === 'GateC') points = "150,260"; // Gate C (South)
    if (startGate === 'GateD') points = "40,150"; // Gate D (West)

    // Intermediate nodes based on persona (avoiding stairs for ADA)
    if (persona === 'wheelchair' || persona === 'stroller') {
      // Connect through elevator / ramp nodes
      if (startGate === 'GateA') points += " -> 150,90 -> 100,90";
      else if (startGate === 'GateB') points += " -> 210,150 -> 210,200";
      else if (startGate === 'GateC') points += " -> 150,210 -> 200,210";
      else points += " -> 90,150 -> 90,100";
    }

    // End points based on section selection
    let sectionCoord = "100,100"; // Section 101-110 (North-West)
    if (destSection === '111-120') sectionCoord = "200,100"; // Section 111-120 (North-East)
    if (destSection === '121-130') sectionCoord = "200,200"; // Section 121-130 (South-East)
    if (destSection === '131-140') sectionCoord = "100,200"; // Section 131-140 (South-West)

    // Convert arrows format to SVG polyline command
    const steps = points.split(" -> ");
    steps.push(sectionCoord);
    return steps.join(" ");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* Route Selector Form */}
      <div className="lg:col-span-2 glass-card p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-4 border-b border-gray-800 pb-3">
            <Compass className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-bold text-white">Smart Accessibility Wayfinding</h2>
          </div>

          <form onSubmit={handleGenerateRoute} className="space-y-4">
            {/* Start Gate */}
            <div>
              <label htmlFor="startGate" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Starting Entrance Gate
              </label>
              <select
                id="startGate"
                className="w-full p-2.5 bg-gray-900 border border-gray-850 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
                value={startGate}
                onChange={(e) => setStartGate(e.target.value)}
              >
                <option value="GateA">Gate A (MetLife Gate - North)</option>
                <option value="GateB">Gate B (Verizon Gate - East)</option>
                <option value="GateC">Gate C (Hess Gate - South)</option>
                <option value="GateD">Gate D (Bud Light Gate - West)</option>
              </select>
            </div>

            {/* Destination Section */}
            <div>
              <label htmlFor="destSection" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Destination Seating Section
              </label>
              <select
                id="destSection"
                className="w-full p-2.5 bg-gray-900 border border-gray-850 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
                value={destSection}
                onChange={(e) => setDestSection(e.target.value)}
              >
                <option value="101-110">Sections 101-110 (North Concourse)</option>
                <option value="111-120">Sections 111-120 (East Concourse)</option>
                <option value="121-130">Sections 121-130 (South Concourse)</option>
                <option value="131-140">Sections 131-140 (West Concourse)</option>
              </select>
            </div>

            {/* Accessibility Persona */}
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Accessibility Needs (Persona)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPersona('general')}
                  className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all ${
                    persona === 'general'
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : 'bg-gray-900 border-gray-800 text-gray-400 hover:text-white'
                  }`}
                >
                  General Fan
                </button>
                <button
                  type="button"
                  onClick={() => setPersona('wheelchair')}
                  className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all flex items-center justify-center gap-1.5 ${
                    persona === 'wheelchair'
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : 'bg-gray-900 border-gray-800 text-gray-400 hover:text-white'
                  }`}
                  aria-label="Wheelchair user accessibility mode"
                >
                  <Accessibility className="w-3.5 h-3.5" />
                  Wheelchair User
                </button>
                <button
                  type="button"
                  onClick={() => setPersona('visual')}
                  className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all flex items-center justify-center gap-1.5 ${
                    persona === 'visual'
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : 'bg-gray-900 border-gray-800 text-gray-400 hover:text-white'
                  }`}
                  aria-label="Visual impairment navigation mode"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Visual Assist
                </button>
                <button
                  type="button"
                  onClick={() => setPersona('stroller')}
                  className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all ${
                    persona === 'stroller'
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : 'bg-gray-900 border-gray-800 text-gray-400 hover:text-white'
                  }`}
                >
                  Family (Stroller)
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 text-sm mt-2"
            >
              <Route className="w-4 h-4" />
              <span>{loading ? 'Calculating Rerouting...' : 'Generate Accessible Route'}</span>
            </button>
          </form>
        </div>

        {/* Dynamic route statistics */}
        {route && (
          <div className="mt-6 p-4 bg-gray-900/60 rounded-xl border border-gray-800 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-400 font-semibold uppercase">Est. Travel Time:</span>
              <span className="text-white font-bold text-sm bg-blue-600/20 px-2 py-0.5 rounded border border-blue-500/20">
                {route.durationMins} mins
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-400 font-semibold uppercase">Total Distance:</span>
              <span className="text-white font-bold text-sm">
                {route.distanceMeters} meters
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-400 font-semibold uppercase">Step-free Path:</span>
              <span className={`font-bold px-2 py-0.5 rounded text-[10px] uppercase border ${
                route.accessible 
                  ? 'bg-emerald-600/20 border-emerald-500/30 text-emerald-400' 
                  : 'bg-yellow-600/20 border-yellow-500/30 text-yellow-400'
              }`}>
                {route.accessible ? '100% ADA Compliant' : 'Contains Stairs'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* SVG Interactive Map Panel */}
      <div className="lg:col-span-3 glass-card p-6 flex flex-col md:flex-row gap-6">
        {/* Interactive Stadium Map Rendering */}
        <div className="flex-1 flex flex-col items-center justify-center">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-blue-500" />
            <span>Interactive Wayfinding Overlay</span>
          </h3>

          <div className="relative w-64 h-64 md:w-80 md:h-80 bg-gray-900/30 rounded-full border border-gray-800 p-2 flex items-center justify-center">
            {/* SVG layout */}
            <svg 
              viewBox="0 0 300 300" 
              className="w-full h-full text-gray-600"
              aria-label="Stadium layout visual map"
              role="img"
            >
              {/* Outer boundary perimeter */}
              <circle cx="150" cy="150" r="130" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="5,5" className="text-gray-800" />

              {/* General seating rings */}
              <circle cx="150" cy="150" r="100" fill="none" stroke="currentColor" strokeWidth="3" className="text-gray-700" />
              <circle cx="150" cy="150" r="60" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-800" />

              {/* Interactive Inner Section Blocks */}
              {/* NW */}
              <path d="M 150,150 L 79,79 A 100,100 0 0,1 150,50 Z" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-800" />
              <text x="95" y="90" className="text-[9px] fill-gray-500 font-bold">101-110</text>

              {/* NE */}
              <path d="M 150,150 L 150,50 A 100,100 0 0,1 221,79 Z" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-800" />
              <text x="180" y="90" className="text-[9px] fill-gray-500 font-bold">111-120</text>

              {/* SE */}
              <path d="M 150,150 L 221,221 A 100,100 0 0,1 150,250 Z" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-800" />
              <text x="180" y="215" className="text-[9px] fill-gray-500 font-bold">121-130</text>

              {/* SW */}
              <path d="M 150,150 L 150,250 A 100,100 0 0,1 79,221 Z" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-800" />
              <text x="95" y="215" className="text-[9px] fill-gray-500 font-bold">131-140</text>

              {/* Outer Gates */}
              {/* Gate A - North */}
              <circle cx="150" cy="30" r="8" className={`${startGate === 'GateA' ? 'fill-blue-500 text-blue-500' : 'fill-gray-900 text-gray-700'} stroke-current`} strokeWidth="2" />
              <text x="146" y="33" className="text-[8px] font-bold fill-white">A</text>

              {/* Gate B - East */}
              <circle cx="270" cy="150" r="8" className={`${startGate === 'GateB' ? 'fill-blue-500 text-blue-500' : 'fill-gray-900 text-gray-700'} stroke-current`} strokeWidth="2" />
              <text x="267" y="153" className="text-[8px] font-bold fill-white">B</text>

              {/* Gate C - South */}
              <circle cx="150" cy="270" r="8" className={`${startGate === 'GateC' ? 'fill-blue-500 text-blue-500' : 'fill-gray-900 text-gray-700'} stroke-current`} strokeWidth="2" />
              <text x="147" y="273" className="text-[8px] font-bold fill-white">C</text>

              {/* Gate D - West */}
              <circle cx="30" cy="150" r="8" className={`${startGate === 'GateD' ? 'fill-blue-500 text-blue-500' : 'fill-gray-900 text-gray-700'} stroke-current`} strokeWidth="2" />
              <text x="27" y="153" className="text-[8px] font-bold fill-white">D</text>

              {/* Accessibility Ramps / Elevators indicators */}
              {/* Elevator A (North-East) */}
              <rect x="180" y="55" width="8" height="8" rx="1" className="fill-emerald-800/80 stroke-emerald-500" strokeWidth="1" />
              <text x="181" y="62" className="text-[6px] fill-emerald-300 font-bold">EL</text>

              {/* Elevator B (South-East) */}
              <rect x="235" y="180" width="8" height="8" rx="1" className="fill-emerald-800/80 stroke-emerald-500" strokeWidth="1" />
              <text x="236" y="187" className="text-[6px] fill-emerald-300 font-bold">EL</text>

              {/* Active Route Draw */}
              {route && (
                <polyline 
                  points={getSvgRoutePoints()} 
                  fill="none" 
                  stroke="#10b981" 
                  strokeWidth="3.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  className="animate-pulse-ring"
                />
              )}
            </svg>
          </div>
        </div>

        {/* Screen Reader Steps text block (WCAG support) */}
        <div className="flex-1 flex flex-col border-t md:border-t-0 md:border-l border-gray-800 pt-6 md:pt-0 md:pl-6">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">
            Route Directions (Screen Reader Friendly)
          </h3>
          
          <div className="flex-1 overflow-y-auto space-y-3" tabIndex={0} aria-label="Route step directions">
            {route ? (
              route.steps.map((step: RouteStep, idx: number) => (
                <div key={idx} className="p-3 bg-gray-900/60 rounded-lg border border-gray-800 flex gap-3 text-xs leading-normal">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-600/10 border border-blue-500/30 text-blue-400 flex items-center justify-center font-bold">
                    {idx + 1}
                  </div>
                  <div>
                    <p className="text-white font-medium">{step.instruction}</p>
                    <div className="flex gap-2 mt-1.5">
                      <span className={`text-[8px] px-1.5 py-0.5 rounded border ${
                        step.accessible 
                          ? 'bg-emerald-600/10 border-emerald-500/20 text-emerald-400' 
                          : 'bg-yellow-600/10 border-yellow-500/20 text-yellow-400'
                      }`}>
                        {step.accessible ? 'Accessible' : 'Includes Stairs'}
                      </span>
                      <span className="text-[8px] bg-gray-800 px-1.5 py-0.5 rounded border border-gray-700 text-gray-400 uppercase">
                        {step.type}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-4 text-gray-500 text-xs">
                <Compass className="w-8 h-8 text-gray-600 mb-2 animate-spin-slow" />
                <p>Select your starting gate and target section, then click "Generate Accessible Route" to view steps.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
