import { useState, useEffect } from 'react';
import { ShieldAlert, PlusCircle, Volume2, Check, Clipboard } from 'lucide-react';
import type { IncidentReport } from '../../../shared/types';

interface OpsCopilotProps {
  role: 'fan' | 'volunteer' | 'organizer';
  token: string;
}

export default function OpsCopilot({ role, token }: OpsCopilotProps) {
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [incidents, setIncidents] = useState<IncidentReport[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Announcement fields
  const [announceTitle, setAnnounceTitle] = useState('');
  const [announceMsg, setAnnounceMsg] = useState('');
  const [generatingAnnounce, setGeneratingAnnounce] = useState(false);
  const [translations, setTranslations] = useState<Record<string, string> | null>(null);
  const [copiedLang, setCopiedLang] = useState<string | null>(null);

  const fetchIncidents = () => {
    fetch('/api/incidents', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setIncidents(data.incidents || []))
      .catch(err => console.error("Error fetching incidents:", err));
  };

  useEffect(() => {
    if (role === 'volunteer' || role === 'organizer') {
      fetchIncidents();
    }
  }, [role, token]);

  const handleIncidentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !location.trim() || submitting) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/incidents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ description, location })
      });

      if (!res.ok) throw new Error("Failed to report incident");
      const newIncident = await res.json();
      setIncidents(prev => [newIncident, ...prev]);
      setDescription('');
      setLocation('');
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGenerateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!announceTitle.trim() || !announceMsg.trim() || generatingAnnounce) return;

    setGeneratingAnnounce(true);
    try {
      const res = await fetch('/api/incidents/announcement', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title: announceTitle, message: announceMsg })
      });

      if (!res.ok) throw new Error("Failed to translate announcement");
      const data = await res.json();
      setTranslations(data.translations);
    } catch (err) {
      console.error(err);
    } finally {
      setGeneratingAnnounce(false);
    }
  };

  const copyToClipboard = (langCode: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLang(langCode);
    setTimeout(() => setCopiedLang(null), 2000);
  };

  // RBAC check
  if (role !== 'volunteer' && role !== 'organizer') {
    return (
      <div className="glass-card p-8 flex flex-col items-center justify-center text-center h-[calc(100vh-200px)] max-w-2xl mx-auto space-y-4">
        <div className="p-4 bg-red-950/30 border border-red-500/30 text-red-500 rounded-full animate-pulse-ring">
          <ShieldAlert className="w-10 h-10" />
        </div>
        <h2 className="text-xl font-bold text-white">Access Denied — Role Unauthorized</h2>
        <p className="text-sm text-gray-400 max-w-md leading-relaxed">
          The Staff Ops Copilot panel is restricted to **Volunteer/Staff** and **Match Organizer** personas. 
          To unlock this dashboard, toggle your view role in the top header.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Column: Incidents Intake & Queue */}
      <div className="space-y-6">
        {/* Incident Intake Form */}
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4 border-b border-gray-850 pb-3">
            <PlusCircle className="w-5 h-5 text-emerald-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Report New Incident</h2>
          </div>

          <form onSubmit={handleIncidentSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="incLocation" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Location/Section</label>
                <input
                  type="text"
                  id="incLocation"
                  className="w-full p-2 bg-gray-900 border border-gray-850 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
                  placeholder="e.g. Section 112 Concourse"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  required
                />
              </div>
            </div>
            <div>
              <label htmlFor="incDesc" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Incident Description</label>
              <textarea
                id="incDesc"
                rows={3}
                className="w-full p-2.5 bg-gray-900 border border-gray-850 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
                placeholder="Describe details: leakages, injuries, seat damage, crowd fights..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors text-sm"
            >
              {submitting ? 'AI Structuring Ticket...' : 'File Report via Ops Copilot'}
            </button>
          </form>
        </div>

        {/* Incidents Queue list */}
        <div className="glass-card p-5">
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4">
            Active Incident Tickets Queue
          </h2>

          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
            {incidents.length > 0 ? (
              incidents.map(inc => {
                let sevColor = "bg-gray-800 border-gray-700 text-gray-400";
                if (inc.severity === 'high') sevColor = "bg-red-600/20 border-red-500/30 text-red-400";
                else if (inc.severity === 'medium') sevColor = "bg-yellow-600/20 border-yellow-500/30 text-yellow-400";
                
                return (
                  <div key={inc.id} className="p-3 bg-gray-900/40 rounded-lg border border-gray-850 text-xs flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white uppercase">{inc.id}</span>
                        <span className="text-[10px] text-gray-500">|</span>
                        <span className="text-gray-400 font-semibold">{inc.location}</span>
                      </div>
                      <div className="flex gap-1.5">
                        <span className={`px-2 py-0.5 rounded text-[8px] uppercase font-bold border ${sevColor}`}>
                          {inc.severity}
                        </span>
                        <span className="bg-blue-600/10 border border-blue-500/20 text-blue-400 px-2 py-0.5 rounded text-[8px] uppercase font-bold">
                          {inc.category}
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-300 leading-normal">{inc.description}</p>
                    <div className="mt-1.5 p-2 bg-gray-950/60 rounded border border-gray-850">
                      <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Suggested Operational Instruction:</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">{inc.suggestedAction}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-6 text-gray-500 text-xs">
                No active incidents registered.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Column: Multilingual Announcement Drawer */}
      <div className="space-y-6">
        <div className="glass-card p-5 h-full flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4 border-b border-gray-850 pb-3">
              <Volume2 className="w-5 h-5 text-blue-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Multilingual Public Announcement Generator</h2>
            </div>

            <form onSubmit={handleGenerateAnnouncement} className="space-y-4">
              <div>
                <label htmlFor="annTitle" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Announcement Subject / Title</label>
                <input
                  type="text"
                  id="annTitle"
                  className="w-full p-2 bg-gray-900 border border-gray-850 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
                  placeholder="e.g. Lost Child / Weather Delay"
                  value={announceTitle}
                  onChange={(e) => setAnnounceTitle(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="annMsg" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Message (English Original)</label>
                <textarea
                  id="annMsg"
                  rows={3}
                  className="w-full p-2.5 bg-gray-900 border border-gray-850 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500"
                  placeholder="e.g. Sector 114 entry is temporarily halted. Please follow instructions of nearby stewards and proceed to Gate C."
                  value={announceMsg}
                  onChange={(e) => setAnnounceMsg(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={generatingAnnounce}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors text-sm"
              >
                {generatingAnnounce ? 'AI Translating to 5 Languages...' : 'Generate Broadcast Announcement'}
              </button>
            </form>
          </div>

          {translations && (
            <div className="mt-6 border-t border-gray-850 pt-5 space-y-4 flex-1 overflow-y-auto max-h-[300px]">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Translation Dispatch Cards</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(translations).map(([langCode, transMsg]) => (
                  <div key={langCode} className="p-3 bg-gray-900/60 rounded-lg border border-gray-850 text-xs flex flex-col justify-between gap-2.5">
                    <div>
                      <div className="flex justify-between items-center mb-1.5 border-b border-gray-850 pb-1">
                        <span className="uppercase text-[9px] font-bold text-blue-400">
                          {langCode === 'en' ? 'English' : (langCode === 'es' ? 'Spanish' : (langCode === 'fr' ? 'French' : (langCode === 'ar' ? 'Arabic' : (langCode === 'hi' ? 'Hindi' : 'Portuguese'))))}
                        </span>
                        <span className="text-[8px] bg-gray-800 text-gray-400 px-1 py-0.5 rounded uppercase font-semibold">{langCode}</span>
                      </div>
                      <p className="text-gray-300 leading-relaxed font-sans">{transMsg}</p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(langCode, transMsg)}
                      className="self-end p-1 text-gray-400 hover:text-white transition-colors bg-gray-800 rounded border border-gray-700 flex items-center gap-1 text-[9px]"
                      title="Copy translation text"
                    >
                      {copiedLang === langCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Clipboard className="w-3 h-3" />}
                      <span>{copiedLang === langCode ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
