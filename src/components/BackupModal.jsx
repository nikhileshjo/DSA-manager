import React, { useState } from 'react';
import { Download, Upload, AlertTriangle, CheckCircle2, Database, X, RefreshCw } from 'lucide-react';
import { api } from '../api/client';

export default function BackupModal({ open = false, onClose }) {
  const [view, setView] = useState('home'); // home | preview | success
  const [backupData, setBackupData] = useState(null);
  const [fileName, setFileName] = useState(null);
  const [inspection, setInspection] = useState(null);
  const [importResult, setImportResult] = useState(null);
  const [confirmWipe, setConfirmWipe] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const blob = await api.exportBackup();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sql_manager_backup_${new Date().toISOString().replace(/[:.-]/g, '')}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Export failed: ' + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  const handleFileSelected = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.json')) {
      alert('Please select a .json backup file.');
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const parsed = JSON.parse(reader.result);
        if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.problems)) {
          throw new Error('Not a valid SQL Manager backup file.');
        }
        setFileName(file.name);
        setBackupData(parsed);
        const result = await api.inspectBackup(parsed);
        setInspection(result);
        setConfirmWipe(false);
        setView('preview');
      } catch (err) {
        alert('Invalid backup file: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!backupData) return;
    setIsImporting(true);
    try {
      const result = await api.importBackup({
        mode: 'wipe',
        backupData,
        duplicateResolutions: {},
      });
      setImportResult(result);
      setView('success');
    } catch (err) {
      alert('Import failed: ' + err.message);
    } finally {
      setIsImporting(false);
    }
  };

  const handleReload = () => {
    window.location.reload();
  };

  if (!open) return null;

  const existing = inspection?.existingStats;
  const incoming = inspection?.importStats;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="mac-window rounded-2xl w-full max-w-lg p-6 space-y-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-indigo-500/20 to-violet-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shadow-lg shadow-indigo-500/10">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-heading text-white">Backup &amp; Restore</h2>
              <p className="text-xs text-slate-400">Export or import your entire SQL practice database</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
            title="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {view === 'home' && (
          <>
            <div className="grid gap-4">
              {/* Export */}
              <div className="glass-card rounded-2xl p-5 border border-indigo-500/20 space-y-4">
                <div className="flex items-center space-x-3">
                  <Download className="h-5 w-5 text-indigo-400" />
                  <h3 className="text-base font-bold text-white">Export Database</h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Downloads a single JSON file containing every problem, tag, solution, attempt, SRS schedule, and setting in your database. Keep it as a safety copy or move it to another computer.
                </p>
                <button
                  onClick={handleExport}
                  disabled={isExporting}
                  className="mac-btn-primary w-full justify-center"
                >
                  {isExporting ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" /> Preparing Export...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4" /> Export &amp; Download
                    </>
                  )}
                </button>
                <p className="text-xs text-slate-400">Saved to your browser's download location.</p>
              </div>

              {/* Import */}
              <div className="glass-card rounded-2xl p-5 border border-white/10 space-y-4">
                <div className="flex items-center space-x-3">
                  <Upload className="h-5 w-5 text-sky-400" />
                  <h3 className="text-base font-bold text-white">Import / Restore</h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Restore a previously exported backup file. Importing replaces all current data in your database.
                </p>
                <label className="block">
                  <span className="text-xs font-bold text-slate-300 mb-1 block">Select backup file (.json)</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileSelected}
                    className="w-full mac-input text-xs"
                  />
                </label>
              </div>
            </div>

            <div className="flex justify-end items-center space-x-3 pt-4 border-t border-white/10">
              <button
                onClick={onClose}
                className="mac-btn-secondary px-4 py-2.5 text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </>
        )}

        {view === 'preview' && (
          <>
            <div className="space-y-4">
              <div className="glass-card rounded-2xl p-5 border border-white/10 space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider text-[11px]">Backup Contents</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-xl bg-black/30 border border-white/10">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">File</div>
                    <div className="text-sm font-mono text-slate-200 truncate" title={fileName}>
                      {fileName}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-black/30 border border-white/10">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Problems</div>
                    <div className="text-sm font-mono text-emerald-400">{incoming?.problemsCount ?? 0}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-black/30 border border-white/10">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Attempts</div>
                    <div className="text-sm font-mono text-emerald-400">{incoming?.attemptsCount ?? 0}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-black/30 border border-white/10">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Tags</div>
                    <div className="text-sm font-mono text-emerald-400">{incoming?.tagsCount ?? 0}</div>
                  </div>
                </div>
              </div>

              {existing && existing.problemsCount > 0 && (
                <div className="glass-card rounded-2xl p-5 border border-rose-500/30 bg-rose-950/20 space-y-3">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="h-5 w-5 text-rose-400 flex-shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-rose-300">Existing Data Will Be Replaced</h4>
                      <p className="text-xs text-rose-100 leading-relaxed">
                        Your database already contains <strong>{existing.problemsCount}</strong> problems,{' '}
                        <strong>{existing.attemptsCount}</strong> attempts, and <strong>{existing.tagsCount}</strong> tags. Importing this backup will <strong>wipe all existing data</strong> and replace it with the backup contents.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 pt-2 border-t border-white/10">
                    <button
                      onClick={handleExport}
                      disabled={isExporting}
                      className="mac-btn-secondary text-xs flex items-center space-x-1.5"
                    >
                      {isExporting ? (
                        <span>Preparing...</span>
                      ) : (
                        <>
                          <Download className="h-3.5 w-3.5" /> Export Existing Data First
                        </>
                      )}
                    </button>
                    <p className="text-xs text-slate-400">Recommended before importing</p>
                  </div>
                  <div className="pt-2">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={confirmWipe}
                        onChange={(e) => setConfirmWipe(e.target.checked)}
                        className="rounded accent-indigo-500 text-indigo-500 bg-black/40 border border-white/10 focus:ring-0"
                      />
                      <span className="text-xs text-slate-200">
                        I understand this will erase all existing data
                      </span>
                    </label>
                  </div>
                </div>
              )}

              <div className="flex justify-end items-center space-x-3 pt-6 border-t border-white/10">
                <button
                  onClick={() => setView('home')}
                  className="mac-btn-secondary px-4 py-2.5 text-xs font-semibold"
                >
                  Choose Another File
                </button>
                {existing && existing.problemsCount > 0 ? (
                  <button
                    onClick={handleImport}
                    disabled={isImporting || !confirmWipe}
                    className="mac-btn-danger px-5 py-2.5 text-xs font-bold"
                  >
                    {isImporting ? 'Importing...' : 'Import &amp; Replace All Data'}
                  </button>
                ) : (
                  <button
                    onClick={handleImport}
                    disabled={isImporting}
                    className="mac-btn-emerald px-5 py-2.5 text-xs font-bold"
                  >
                    {isImporting ? 'Importing...' : 'Import Data'}
                  </button>
                )}
              </div>
            </div>
          </>
        )}

        {view === 'success' && (
          <>
            <div className="flex flex-col items-center justify-center text-center space-y-4 py-2">
              <div className="h-16 w-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold font-heading text-white">Import Complete</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {importResult?.importedProblemsCount} problems and{' '}
                {importResult?.importedAttemptsCount} attempts restored. Your tags, solutions, SRS schedules, and settings were also restored.
              </p>
              <p className="text-xs text-amber-300 font-medium">
                Please reload the page to see your restored data.
              </p>
              <div className="flex items-center space-x-3 pt-4 border-t border-white/10">
                <button
                  onClick={onClose}
                  className="mac-btn-secondary px-4 py-2.5 text-xs font-semibold"
                >
                  Close
                </button>
                <button
                  onClick={handleReload}
                  className="mac-btn-primary px-5 py-2.5 text-xs font-bold shadow-lg"
                >
                  <RefreshCw className="h-4 w-4" /> Reload App
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
