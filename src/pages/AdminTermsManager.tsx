import { useState, useEffect } from 'react';
import * as organizerService from '../services/organizerService';

export default function AdminTermsManager() {
  const [activeType, setActiveType] = useState<'USER' | 'ORGANIZER'>('USER');
  const [content, setContent] = useState('');
  const [version, setVersion] = useState('1.0');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => { loadTerms(); }, [activeType]);

  const loadTerms = async () => {
    setLoading(true);
    try {
      const resp = await organizerService.getTerms(activeType);
      const d = resp?.data ?? resp;
      setContent(d.content ?? '');
      setVersion(d.version ?? '1.0');
    } catch { setContent(''); }
    finally { setLoading(false); }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await organizerService.updateTerms(activeType, content, version);
      setToast('Terms saved successfully');
      setTimeout(() => setToast(''), 3000);
    } catch { setToast('Failed to save terms'); }
    finally { setSaving(false); }
  };

  return (
    <div>
      {toast && <div className="fixed top-6 right-6 z-50 bg-gray-900 text-white px-5 py-3 rounded-xl text-sm font-medium shadow-xl">{toast}</div>}

      <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Terms of Service</h2>
          <p className="text-gray-500 text-sm mt-1">Edit platform terms displayed to users and organizers</p>
        </div>
        <a href={`/terms/${activeType.toLowerCase()}`} target="_blank" rel="noopener noreferrer" className="text-sm text-green-600 font-semibold hover:underline">
          Preview →
        </a>
      </div>

      {/* Type toggle */}
      <div className="flex gap-2 mb-6">
        {(['USER', 'ORGANIZER'] as const).map(t => (
          <button key={t} onClick={() => setActiveType(t)}
            className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${activeType === t ? 'bg-green-600 text-white' : 'bg-white border border-gray-200 text-gray-500 hover:border-gray-400'}`}>
            {t === 'USER' ? 'User Terms' : 'Organizer Terms'}
          </button>
        ))}
      </div>

      {/* Version */}
      <div className="mb-4 flex items-center gap-4">
        <label className="text-sm font-bold text-gray-700">Version</label>
        <input value={version} onChange={e => setVersion(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-24 focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="1.0" />
      </div>

      {/* Content editor */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-6">
        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
          <p className="text-xs font-mono text-gray-400">Markdown supported: # Heading, ## Section, **bold**</p>
        </div>
        {loading ? (
          <div className="p-6 space-y-3">{[1,2,3].map(i => <div key={i} className="h-4 bg-gray-100 rounded animate-pulse" />)}</div>
        ) : (
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            className="w-full p-6 text-sm font-mono text-gray-700 resize-none focus:outline-none"
            style={{ minHeight: 520 }}
          />
        )}
      </div>

      <button onClick={handleSave} disabled={saving || loading}
        className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-bold text-sm disabled:opacity-50 transition-all">
        {saving ? 'Saving…' : 'Save Terms'}
      </button>
    </div>
  );
}