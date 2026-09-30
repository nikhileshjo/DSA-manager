import React, { useState } from 'react';
import { X, Settings, Check } from 'lucide-react';

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
      <div className="glass-card rounded-2xl w-full max-w-md border border-slate-700 p-6 space-y-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
            <Settings className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-heading text-white">Settings</h2>
            <p className="text-xs text-slate-400">Configure daily practice capacity</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-300 block">
              Daily Practice Capacity (problems per day)
            </label>

            {/* Presets */}
            <div className="grid grid-cols-4 gap-2">
              {presets.map((val) => (
                <button
                  type="button"
                  key={val}
                  onClick={() => { setCapacity(val); setCustomValue(val); }}
                  className={`py-2.5 rounded-xl border text-sm font-bold transition-all ${
                    capacity === val
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/30'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-900'
                  }`}
                >
                  {val}/day
                </button>
              ))}
            </div>

            {/* Custom Input */}
            <div>
              <label className="text-[11px] text-slate-400 font-semibold block mb-1">Custom Capacity:</label>
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
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800">
            The practice allocator will automatically generate at most <strong>{capacity}</strong> practice items each day, dynamically balancing SRS reviews, weak fresh problems, and external practice slots.
          </p>

          <div className="flex justify-end space-x-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-900 text-slate-300 border border-slate-800 font-semibold text-xs hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-md shadow-indigo-600/20 hover:bg-indigo-500 transition-all"
            >
              Save Capacity
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
