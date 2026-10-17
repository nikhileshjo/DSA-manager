import React, { useState } from 'react';
import { X, Settings, CheckCircle2, Sliders } from 'lucide-react';

export default function SettingsModal({ currentCapacity, onClose, onSave }) {
  const [capacity, setCapacity] = useState(currentCapacity || 5);
  const [customValue, setCustomValue] = useState(currentCapacity || 5);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const presets = [3, 5, 8, 10];

  const handleSubmit = async (e) => {
    e.preventDefault();
    const finalVal = parseInt(capacity, 10);
    if (isNaN(finalVal) || finalVal < 1) {
      alert('Please enter a valid daily practice capacity (1 or more).');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSave(finalVal);
      onClose();
    } catch (err) {
      alert('Error updating capacity: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="mac-window rounded-2xl w-full max-w-md p-6 space-y-6 shadow-2xl relative">
        {/* macOS Window Header with Traffic Lights */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="mac-traffic-lights">
            <div className="mac-dot mac-dot-close" onClick={onClose} title="Close">
              <span>✕</span>
            </div>
            <div className="mac-dot mac-dot-minimize" title="Minimize">
              <span>−</span>
            </div>
            <div className="mac-dot mac-dot-maximize" title="Zoom">
              <span>⤢</span>
            </div>
          </div>

          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Preferences
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
            title="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center space-x-3.5">
          <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-indigo-500/20 to-violet-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shadow-lg shadow-indigo-500/10">
            <Sliders className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-heading text-white">Daily Capacity</h2>
            <p className="text-xs text-slate-400">Configure your daily SRS practice volume</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-300 block">
              Daily Practice Capacity (problems per day)
            </label>

            {/* Presets Grid */}
            <div className="grid grid-cols-4 gap-2">
              {presets.map((val) => (
                <button
                  type="button"
                  key={val}
                  onClick={() => { setCapacity(val); setCustomValue(val); }}
                  className={`py-2.5 rounded-xl border text-sm font-bold transition-all ${
                    capacity === val
                      ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-600/30 scale-[1.02]'
                      : 'bg-black/30 border-white/10 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  {val}/day
                </button>
              ))}
            </div>

            {/* Custom Input */}
            <div className="pt-1">
              <label className="text-[11px] text-slate-400 font-semibold block mb-1">Custom Capacity Count:</label>
              <input
                type="number"
                min="1"
                max="50"
                value={customValue}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  setCustomValue(e.target.value);
                  if (!isNaN(val)) setCapacity(val);
                }}
                className="w-full px-3 py-2 rounded-xl mac-input text-xs text-white placeholder-slate-500 font-mono font-bold"
              />
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed bg-black/30 p-3.5 rounded-xl border border-white/10">
            The adaptive practice allocator dynamically balances due SRS reviews (capped to avoid burnout), weak-topic fresh problems, and external practice slots to hit exactly <strong>{capacity}</strong> items per day.
          </p>

          <div className="flex justify-end items-center space-x-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="mac-btn-secondary px-4 py-2.5 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="mac-btn-primary px-5 py-2.5 text-xs font-bold shadow-lg"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Save Capacity</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
