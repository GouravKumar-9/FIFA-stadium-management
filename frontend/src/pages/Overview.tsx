import { useEffect, useState } from 'react';
import { Users, AlertTriangle, ShieldCheck, Leaf, Clock, Calendar, Ticket } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface OverviewProps {
  role: 'fan' | 'volunteer' | 'organizer';
  token: string;
}

export default function Overview({ role, token }: OverviewProps) {
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    attendance: 80000,
    maxCapacity: 82500,
    densityAlerts: 1,
    activeIncidents: 1,
    co2Saved: 1240
  });


  useEffect(() => {
    // Fetch live incidents if the user has staff access
    if (role === 'volunteer' || role === 'organizer') {
      fetch('/api/incidents', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.incidents) {
            setStats(prev => ({ ...prev, activeIncidents: data.incidents.length }));
          }
        })
        .catch(err => console.error("Error fetching incidents:", err));
    }
  }, [role, token]);

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">{t('appName')}</h1>
          <p className="text-gray-400 mt-1">{t('tagline')}</p>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 bg-blue-600/20 border border-blue-500/30 rounded-lg text-blue-400 text-sm">
          <Calendar className="w-4 h-4" />
          <span>{t('activeMatch')}: <strong>USA vs Spain</strong></span>
        </div>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Attendance Card */}
        <div className="glass-card p-5 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Total Attendance</p>
              <h3 className="text-2xl font-bold mt-1 text-white">80,000 / 82,500</h3>
            </div>
            <div className="p-2 bg-blue-600/20 text-blue-400 rounded-lg">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
            <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '97%' }}></div>
          </div>
          <div className="mt-2 text-xs text-blue-400 flex items-center justify-between">
            <span>Stadium near peak load</span>
            <span className="font-semibold">97% Occupied</span>
          </div>
        </div>

        {/* Crowd Alert Card */}
        <div className="glass-card p-5 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Crowd Alert Status</p>
              <h3 className="text-2xl font-bold mt-1 text-red-500">1 Critical Gate</h3>
            </div>
            <div className="p-2 bg-red-600/20 text-red-400 rounded-lg animate-pulse-ring">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-red-400">
            <span>Gate B density exceeds 85%</span>
            <span className="font-semibold">Rerouting Active</span>
          </div>
        </div>

        {/* Active Incidents Card */}
        <div className="glass-card p-5 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Active Incidents</p>
              <h3 className="text-2xl font-bold mt-1 text-yellow-500">
                {role === 'fan' ? 'Protected Info' : `${stats.activeIncidents} Active`}
              </h3>
            </div>
            <div className="p-2 bg-yellow-600/20 text-yellow-400 rounded-lg">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-yellow-400">
            <span>{role === 'fan' ? 'Sign in as Staff to view' : '1 Facilities priority ticket'}</span>
            <span className="font-semibold">{role === 'fan' ? 'Locked' : 'Open'}</span>
          </div>
        </div>

        {/* Sustainability Index Card */}
        <div className="glass-card p-5 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Transit CO2 Saved</p>
              <h3 className="text-2xl font-bold mt-1 text-emerald-400">1,240 kg CO2</h3>
            </div>
            <div className="p-2 bg-emerald-600/20 text-emerald-400 rounded-lg">
              <Leaf className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs text-emerald-400">
            <span>72% Fans chose low-carbon travel</span>
            <span className="font-semibold">+12% vs last game</span>
          </div>
        </div>
      </div>

      {/* Main Layout Splitting */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Match details card */}
        <div className="glass-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs bg-red-600/20 text-red-400 px-2 py-1 rounded-md font-bold tracking-wider uppercase">Live Kickoff Soon</span>
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <Clock className="w-3.5 h-3.5" />
                <span>18:00 Local</span>
              </div>
            </div>
            <div className="text-center my-6">
              <div className="flex items-center justify-center gap-6">
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-blue-700/30 flex items-center justify-center border border-blue-500/40 text-2xl font-extrabold text-white">US</div>
                  <span className="mt-2 text-sm font-semibold text-white">USA</span>
                </div>
                <span className="text-3xl font-extrabold text-gray-500">VS</span>
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-yellow-600/20 flex items-center justify-center border border-yellow-500/40 text-2xl font-extrabold text-white">ES</div>
                  <span className="mt-2 text-sm font-semibold text-white">Spain</span>
                </div>
              </div>
            </div>
            <hr className="border-gray-800 my-4" />
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Venue:</span>
                <span className="text-white font-medium">MetLife Stadium, NJ</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Group:</span>
                <span className="text-white font-medium">Group A - Match #12</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Gate opening:</span>
                <span className="text-white font-medium">15:00 EST (Opened)</span>
              </div>
            </div>
          </div>
          <div className="mt-6">
            <div className="p-3 bg-gray-900/60 rounded-lg flex items-center gap-3">
              <Ticket className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <div className="text-xs text-gray-400">
                Show ticket barcode at Gate A/B accessible lanes for instant bag check routing.
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Person-specific operational highlights */}
        <div className="lg:col-span-2 glass-card p-6">
          <h2 className="text-lg font-bold text-white mb-4">Operational Status Alerts</h2>
          
          <div className="space-y-4">
            <div className="p-4 bg-red-950/20 border border-red-900/40 rounded-lg flex gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500 mt-1.5 flex-shrink-0 animate-pulse-red"></div>
              <div>
                <h4 className="text-sm font-bold text-red-400">Gate B Ingress Congestion</h4>
                <p className="text-xs text-gray-400 mt-0.5">
                  Verizon gate count exceeds 85% capacity limits due to local rail arrivals. Ingress speeds delayed. Recommended: Organizers reroute incoming fans through the East concourse pathways to Gate C.
                </p>
              </div>
            </div>

            <div className="p-4 bg-yellow-950/20 border border-yellow-900/40 rounded-lg flex gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500 mt-1.5 flex-shrink-0"></div>
              <div>
                <h4 className="text-sm font-bold text-yellow-400">Facilities Maintenance Report</h4>
                <p className="text-xs text-gray-400 mt-0.5">
                  {role === 'fan' ? (
                    "Routine maintenance checks in progress on Level 2 concessions. All passenger elevators are operational."
                  ) : (
                    `Active Ticket: Slippery water leak in Section 112. Severity: MEDIUM. Assigned response time is 10 mins. Volunteer staff have posted temporary safety markers.`
                  )}
                </p>
              </div>
            </div>

            <div className="p-4 bg-emerald-950/20 border border-emerald-900/40 rounded-lg flex gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0"></div>
              <div>
                <h4 className="text-sm font-bold text-emerald-400">Sustainability Notice</h4>
                <p className="text-xs text-gray-400 mt-0.5">
                  Train departures from Secaucus Junction are running every 8 minutes. Emitted greenhouse gases are reduced by 85% when commuting by transit compared to parking lot drop-offs. Recommending transit to all fans.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
