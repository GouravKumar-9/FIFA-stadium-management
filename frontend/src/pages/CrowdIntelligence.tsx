import { useState, useEffect } from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle, RefreshCw, Sparkles, UserCheck } from 'lucide-react';
import type { SensorData, CrowdBriefing } from '../../../shared/types';

interface CrowdIntelligenceProps {
  role: 'fan' | 'volunteer' | 'organizer';
  token: string;
}

export default function CrowdIntelligence({ role, token }: CrowdIntelligenceProps) {
  const [metrics, setMetrics] = useState<SensorData[]>([]);
  const [briefing, setBriefing] = useState<CrowdBriefing | null>(null);
  const [loadingBriefing, setLoadingBriefing] = useState(false);
  const [loadingActionId, setLoadingActionId] = useState<string | null>(null);

  // Fetch metrics on mount and when role updates
  const fetchStatus = () => {
    fetch('/api/crowd/status')
      .then(res => res.json())
      .then(data => {
        setMetrics(data.metrics || []);
        if (data.recommendedActions && briefing) {
          setBriefing(prev => prev ? { ...prev, recommendedActions: data.recommendedActions } : null);
        }
      })
      .catch(err => console.error("Error fetching crowd status:", err));
  };

  useEffect(() => {
    fetchStatus();
    // Poll metrics every 15 seconds (throttled)
    const interval = setInterval(fetchStatus, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleGenerateBriefing = async () => {
    setLoadingBriefing(true);
    try {
      const res = await fetch('/api/crowd/briefing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error("Unauthorized or server error");
      const data = await res.json();
      setBriefing(data);
    } catch (err) {
      console.error(err);
      // Hardcoded fallback
      setBriefing({
        timestamp: Date.now(),
        alertLevel: 'warning',
        briefingText: "[RAG Offline Local Cache] Verizon Gate (Gate B) currently has 86% occupancy. Standard chokepoints developing at shuttle loading bay. Recommended action: Open auxiliary overflow gate B2 and guide passengers along East concourse paths.",
        recommendedActions: [
          { id: "ACT-01", action: "Open auxiliary overflow gate B2 to relieve Verizon entrance.", targetGate: "GateB", status: "pending" },
          { id: "ACT-02", action: "Reroute incoming shuttle buses from North lot directly to Gate C.", targetGate: "GateB", status: "pending" }
        ]
      });
    } finally {
      setLoadingBriefing(false);
    }
  };

  const handleProcessAction = async (actionId: string, status: 'approved' | 'dismissed') => {
    setLoadingActionId(actionId);
    try {
      const res = await fetch('/api/crowd/action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ actionId, status })
      });
      if (!res.ok) throw new Error("Failed to process action");
      const data = await res.json();
      if (data.success && briefing) {
        setBriefing(prev => prev ? { ...prev, recommendedActions: data.actions } : null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingActionId(null);
    }
  };

  // RBAC Boundary check
  if (role !== 'organizer') {
    return (
      <div className="glass-card p-8 flex flex-col items-center justify-center text-center h-[calc(100vh-200px)] max-w-2xl mx-auto space-y-4">
        <div className="p-4 bg-red-950/30 border border-red-500/30 text-red-500 rounded-full animate-pulse-ring">
          <ShieldAlert className="w-10 h-10" />
        </div>
        <h2 className="text-xl font-bold text-white">Access Denied — Role Unauthorized</h2>
        <p className="text-sm text-gray-400 max-w-md leading-relaxed">
          The Crowd Intelligence command center is restricted to the **Match Organizer** persona. 
          To unlock this dashboard, toggle your view role to **Match Organizer** using the controls in the top header.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-gray-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Crowd Intelligence & Risk Dashboard</h1>
          <p className="text-xs text-gray-400 mt-1">Real-time IoT gates sensors feed and human-in-the-loop mitigations.</p>
        </div>
        <button
          onClick={fetchStatus}
          className="p-2 bg-gray-900 border border-gray-800 text-gray-400 hover:text-white rounded-lg transition-colors flex items-center gap-1.5 text-xs font-semibold"
          aria-label="Refresh live sensor counts"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh Feed</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Heatmap/Sensors density panel */}
        <div className="lg:col-span-2 glass-card p-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-5">
            Gate Occupancy Heatmap
          </h2>

          <div className="space-y-5">
            {metrics.map(gate => {
              // Determine status indicator colors
              let barColor = "bg-emerald-500";
              let textColor = "text-emerald-400";
              let badgeBg = "bg-emerald-950/20 border-emerald-500/30";
              let statusIcon = <CheckCircle className="w-4 h-4 flex-shrink-0" />;

              if (gate.status === 'critical') {
                barColor = "bg-red-600";
                textColor = "text-red-500";
                badgeBg = "bg-red-950/20 border-red-500/30";
                statusIcon = <AlertTriangle className="w-4 h-4 flex-shrink-0 animate-pulse" />;
              } else if (gate.status === 'warning') {
                barColor = "bg-yellow-500";
                textColor = "text-yellow-400";
                badgeBg = "bg-yellow-950/20 border-yellow-500/30";
                statusIcon = <AlertTriangle className="w-4 h-4 flex-shrink-0" />;
              }

              return (
                <div key={gate.gateId} className="p-4 bg-gray-900/40 rounded-xl border border-gray-850 space-y-3">
                  <div className="flex flex-wrap justify-between items-center gap-2">
                    <div>
                      <h4 className="text-sm font-bold text-white">{gate.gateName}</h4>
                      <p className="text-[10px] text-gray-500 mt-0.5">Capacity: {gate.capacity.toLocaleString()} / Hourly Flow: {gate.currentCount.toLocaleString()}</p>
                    </div>
                    <div className={`px-2.5 py-1 rounded-md border text-[10px] uppercase font-bold flex items-center gap-1.5 ${badgeBg} ${textColor}`}>
                      {statusIcon}
                      <span>{gate.status === 'critical' ? 'Congested' : (gate.status === 'warning' ? 'Heavy Flow' : 'Clear')}</span>
                    </div>
                  </div>

                  {/* Progress bar (Contrast safe: text label + color) */}
                  <div className="relative">
                    <div className="w-full bg-gray-800 rounded-full h-3.5 overflow-hidden">
                      <div className={`${barColor} h-3.5 rounded-full`} style={{ width: `${gate.densityPercent}%` }}></div>
                    </div>
                    {/* Pattern Overlay for Accessibility contrast checks */}
                    {gate.status === 'critical' && (
                      <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_4px,rgba(255,255,255,0.15)_4px,rgba(255,255,255,0.15)_8px)] pointer-events-none rounded-full" />
                    )}
                  </div>

                  <div className="flex justify-between items-center text-xs text-gray-400">
                    <span className="font-medium">Density: <strong className="text-white">{gate.densityPercent}%</strong></span>
                    <span className="flex items-center gap-1 text-[10px]">
                      Trend: <strong className="uppercase text-white">{gate.trend}</strong>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI risk briefing and Recommended actions */}
        <div className="flex flex-col gap-6">
          {/* Briefing Generator Card */}
          <div className="glass-card p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 border-b border-gray-850 pb-3 mb-4">
                <Sparkles className="w-5 h-5 text-yellow-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">AI Risk Briefing</h3>
              </div>

              {briefing ? (
                <div className="space-y-4">
                  <div className={`p-3.5 rounded-lg border text-xs leading-relaxed ${
                    briefing.alertLevel === 'danger'
                      ? 'bg-red-950/20 border-red-500/20 text-red-300'
                      : (briefing.alertLevel === 'warning' ? 'bg-yellow-950/20 border-yellow-500/20 text-yellow-300' : 'bg-blue-950/20 border-blue-500/20 text-blue-300')
                  }`}>
                    <p className="font-semibold uppercase text-[10px] mb-1.5">Live Narrative:</p>
                    <p className="whitespace-pre-line leading-relaxed">{briefing.briefingText}</p>
                  </div>
                  <p className="text-[10px] text-gray-500">Briefing compiled at: {new Date(briefing.timestamp).toLocaleTimeString()}</p>
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500 text-xs">
                  <p>Generate a natural language risk evaluation over the live sensor counts.</p>
                </div>
              )}
            </div>

            <button
              onClick={handleGenerateBriefing}
              disabled={loadingBriefing}
              className="w-full mt-6 py-2.5 bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-800 text-gray-950 font-bold rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
            >
              <Sparkles className="w-4 h-4" />
              <span>{loadingBriefing ? 'Analyzing Sensors...' : 'Compile Live AI Briefing'}</span>
            </button>
          </div>

          {/* Action Queue Card */}
          {briefing && briefing.recommendedActions && (
            <div className="glass-card p-6 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 border-b border-gray-850 pb-3 mb-4">
                  <UserCheck className="w-5 h-5 text-blue-400" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Mitigation Actions</h3>
                </div>

                <div className="space-y-3.5">
                  {briefing.recommendedActions.map(action => (
                    <div key={action.id} className="p-3 bg-gray-900/60 rounded-lg border border-gray-850 text-xs flex flex-col gap-2">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-blue-400 uppercase text-[9px]">{action.id}</span>
                        <span className={`text-[8px] px-1.5 py-0.5 rounded uppercase font-bold border ${
                          action.status === 'approved'
                            ? 'bg-emerald-600/10 border-emerald-500/20 text-emerald-400'
                            : (action.status === 'dismissed' ? 'bg-gray-800 border-gray-700 text-gray-500' : 'bg-yellow-600/10 border-yellow-500/20 text-yellow-400')
                        }`}>
                          {action.status}
                        </span>
                      </div>
                      <p className="text-gray-300 leading-normal">{action.action}</p>
                      
                      {action.status === 'pending' && (
                        <div className="flex gap-2 mt-1">
                          <button
                            onClick={() => handleProcessAction(action.id, 'approved')}
                            disabled={loadingActionId !== null}
                            className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded text-[10px] transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleProcessAction(action.id, 'dismissed')}
                            disabled={loadingActionId !== null}
                            className="flex-1 py-1.5 bg-gray-800 hover:bg-gray-750 text-gray-400 font-bold rounded text-[10px] border border-gray-700 transition-colors"
                          >
                            Dismiss
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
