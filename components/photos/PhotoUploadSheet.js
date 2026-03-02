'use client';

import { useState } from 'react';
import BottomSheet from '../ui/BottomSheet';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { useApp } from '../../lib/context/AppContext';

const inputStyle = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: 10,
  background: 'var(--surface2)',
  color: 'var(--text)',
  border: '1px solid var(--border)',
  fontSize: 16,
  outline: 'none',
};

async function compressImage(file, maxWidth = 1200) {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const ratio = Math.min(1, maxWidth / img.width);
      const canvas = document.createElement('canvas');
      canvas.width  = Math.round(img.width * ratio);
      canvas.height = Math.round(img.height * ratio);
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      canvas.toBlob(blob => resolve(blob), 'image/jpeg', 0.82);
    };
    img.src = url;
  });
}

export default function PhotoUploadSheet({ open, onClose, locations, onUploaded }) {
  const { showToast } = useApp();
  const [locationId, setLocationId] = useState('');
  const [species, setSpecies]       = useState('');
  const [weightLb, setWeightLb]     = useState('');
  const [weightOz, setWeightOz]     = useState('');
  const [caption, setCaption]       = useState('');
  const [caughtAt, setCaughtAt]     = useState(new Date().toISOString().slice(0, 10));
  const [file, setFile]             = useState(null);
  const [preview, setPreview]       = useState(null);
  const [uploading, setUploading]   = useState(false);

  function handleFile(e) {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  function reset() {
    setLocationId(''); setSpecies(''); setWeightLb(''); setWeightOz('');
    setCaption(''); setFile(null); setPreview(null); setUploading(false);
    setCaughtAt(new Date().toISOString().slice(0, 10));
  }

  async function handleUpload() {
    if (!file || !locationId) return;
    setUploading(true);

    try {
      let storageKey = null;
      let photoUrl   = preview; // fallback: use local blob URL

      if (isSupabaseConfigured) {
        const compressed = await compressImage(file);
        const fileName = `photos/${crypto.randomUUID()}.jpg`;
        const { data: storData, error: storErr } = await supabase.storage
          .from('carper-photos')
          .upload(fileName, compressed, { contentType: 'image/jpeg', upsert: false });

        if (storErr) throw storErr;
        storageKey = storData.path;

        // Get public URL
        const { data: urlData } = supabase.storage.from('carper-photos').getPublicUrl(storageKey);
        photoUrl = urlData?.publicUrl || preview;

        // Insert DB row
        await supabase.from('catch_photos').insert({
          location_id: locationId,
          storage_key: storageKey,
          caption: caption.trim() || null,
          fish_species: species.trim() || null,
          weight_lb: weightLb ? parseInt(weightLb) : null,
          weight_oz: weightOz ? parseInt(weightOz) : null,
          caught_at: caughtAt,
        });
      }

      onUploaded({
        id: crypto.randomUUID(),
        location_id: locationId,
        storage_key: storageKey,
        url: photoUrl,
        caption: caption.trim() || null,
        fish_species: species.trim() || null,
        weight_lb: weightLb ? parseInt(weightLb) : null,
        weight_oz: weightOz ? parseInt(weightOz) : null,
        caught_at: caughtAt,
        created_at: new Date().toISOString(),
      });

      showToast('Catch photo saved!', 'success');
      reset();
      onClose();
    } catch (e) {
      console.error('Upload error:', e);
      showToast('Upload failed — check your connection', 'error');
    } finally {
      setUploading(false);
    }
  }

  return (
    <BottomSheet open={open} onClose={() => { reset(); onClose(); }} title="Add Catch Photo">
      <div className="flex flex-col gap-4 p-5">

        {/* Photo picker */}
        <div>
          <label
            className="flex flex-col items-center justify-center rounded-xl cursor-pointer overflow-hidden"
            style={{
              height: preview ? 'auto' : 140,
              background: 'var(--surface2)',
              border: `2px dashed ${preview ? 'transparent' : 'var(--border)'}`,
            }}
          >
            {preview ? (
              <img src={preview} alt="Preview" className="w-full rounded-xl object-cover" style={{ maxHeight: 200 }} />
            ) : (
              <div className="flex flex-col items-center gap-2 py-6">
                <span className="text-3xl">📷</span>
                <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Tap to choose photo</span>
              </div>
            )}
            <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFile} />
          </label>
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm mb-1.5" style={{ color: 'var(--text-muted)' }}>Location *</label>
          <select style={inputStyle} value={locationId} onChange={e => setLocationId(e.target.value)}>
            <option value="">Select location...</option>
            {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
          </select>
        </div>

        {/* Species */}
        <div>
          <label className="block text-sm mb-1.5" style={{ color: 'var(--text-muted)' }}>Fish Species</label>
          <input style={inputStyle} placeholder="e.g. Common Carp, Mirror Carp" value={species} onChange={e => setSpecies(e.target.value)} />
        </div>

        {/* Weight */}
        <div>
          <label className="block text-sm mb-1.5" style={{ color: 'var(--text-muted)' }}>Weight</label>
          <div className="flex gap-2">
            <div className="flex-1 flex items-center gap-1">
              <input type="number" min="0" style={inputStyle} placeholder="0" value={weightLb} onChange={e => setWeightLb(e.target.value)} />
              <span className="text-sm flex-shrink-0" style={{ color: 'var(--text-muted)' }}>lb</span>
            </div>
            <div className="flex-1 flex items-center gap-1">
              <input type="number" min="0" max="15" style={inputStyle} placeholder="0" value={weightOz} onChange={e => setWeightOz(e.target.value)} />
              <span className="text-sm flex-shrink-0" style={{ color: 'var(--text-muted)' }}>oz</span>
            </div>
          </div>
        </div>

        {/* Date */}
        <div>
          <label className="block text-sm mb-1.5" style={{ color: 'var(--text-muted)' }}>Catch Date</label>
          <input type="date" style={inputStyle} value={caughtAt} onChange={e => setCaughtAt(e.target.value)} />
        </div>

        {/* Caption */}
        <div>
          <label className="block text-sm mb-1.5" style={{ color: 'var(--text-muted)' }}>Caption (optional)</label>
          <input style={inputStyle} placeholder="e.g. Personal best!" value={caption} onChange={e => setCaption(e.target.value)} />
        </div>

        <button
          onClick={handleUpload}
          disabled={!file || !locationId || uploading}
          className="w-full py-4 rounded-xl font-semibold text-base"
          style={{
            background: (file && locationId && !uploading) ? 'var(--accent)' : 'var(--surface2)',
            color: (file && locationId && !uploading) ? 'white' : 'var(--text-dim)',
          }}
        >
          {uploading ? 'Uploading...' : 'Save Photo'}
        </button>
      </div>
    </BottomSheet>
  );
}
