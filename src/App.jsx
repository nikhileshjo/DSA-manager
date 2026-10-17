import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import PracticeView from './components/PracticeView';
import ProblemList from './components/ProblemList';
import ProblemDetailModal from './components/ProblemDetailModal';
import ProblemFormModal from './components/ProblemFormModal';
import AttemptModal from './components/AttemptModal';
import ExternalSlotModal from './components/ExternalSlotModal';
import StatsView from './components/StatsView';
import SettingsModal from './components/SettingsModal';
import { api } from './api/client';

export default function App() {
  const [activeTab, setActiveTab] = useState('practice');

  // Data state
  const [practiceSession, setPracticeSession] = useState(null);
  const [completedMap, setCompletedMap] = useState({});
  const [problems, setProblems] = useState([]);
  const [tags, setTags] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [filters, setFilters] = useState({
    search: '',
    difficulty: '',
    sourceType: '',
    tagId: '',
    dueStatus: '',
    attemptedStatus: '',
  });

  // Modal states
  const [selectedProblem, setSelectedProblem] = useState(null); // Detail view
  const [problemToEdit, setProblemToEdit] = useState(null); // Form modal
  const [showAddForm, setShowAddForm] = useState(false);
  const [attemptingProblem, setAttemptingProblem] = useState(null); // { problem, type }
  const [attemptingExternal, setAttemptingExternal] = useState(null); // slot
  const [showSettings, setShowSettings] = useState(false);
  const [isMidnight, setIsMidnight] = useState(() => {
    return localStorage.getItem('sql_theme') === 'midnight' || localStorage.getItem('dsa_theme') === 'midnight';
  });

  useEffect(() => {
    if (isMidnight) {
      document.documentElement.classList.add('midnight');
      localStorage.setItem('sql_theme', 'midnight');
    } else {
      document.documentElement.classList.remove('midnight');
      localStorage.setItem('sql_theme', 'dark');
    }
  }, [isMidnight]);

  const toggleTheme = () => setIsMidnight((prev) => !prev);

  // Load initial data
  const loadData = async () => {
    try {
      setLoading(true);
      const [session, tagsData, statsData] = await Promise.all([
        api.getTodayPractice(),
        api.getTags(),
        api.getStats(),
      ]);
      setPracticeSession(session);
      setTags(tagsData);
      setStats(statsData);
      await loadProblems(filters);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadTags = async () => {
    try {
      const tagsData = await api.getTags();
      setTags(tagsData);
    } catch (err) {
      console.error('Error loading tags:', err);
    }
  };

  const loadProblems = async (currentFilters) => {
    try {
      const data = await api.getProblems(currentFilters);
      setProblems(data);
    } catch (err) {
      console.error('Error loading problems:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadProblems(filters);
  }, [filters]);

  // Actions
  const handleRefreshPractice = async () => {
    const session = await api.getTodayPractice();
    setPracticeSession(session);
    const statsData = await api.getStats();
    setStats(statsData);
  };

  const handleRecordDatabaseAttempt = async (attemptData) => {
    await api.logProblemAttempt(attemptData.problem_id, attemptData);
    setCompletedMap((prev) => ({ ...prev, [attemptData.problem_id]: true }));
    await handleRefreshPractice();
    loadProblems(filters);
  };

  const handleRecordExternalAttempt = async (attemptData) => {
    await api.recordAttempt(attemptData);
    if (attemptingExternal) {
      setCompletedMap((prev) => ({ ...prev, [attemptingExternal.id]: true }));
    }
    await handleRefreshPractice();
    await loadTags();
    loadProblems(filters);
  };

  const handleSaveProblem = async (payload, existingId) => {
    if (existingId) {
      await api.updateProblem(existingId, payload);
    } else {
      await api.createProblem(payload);
    }
    await loadData();
  };

  const handleDeleteProblem = async (problemId) => {
    if (!window.confirm('Are you sure you want to delete this problem and all its history?')) return;
    await api.deleteProblem(problemId);
    await loadData();
  };

  const handleRefreshProblemDetail = async (id) => {
    const fullProblem = await api.getProblem(id);
    setSelectedProblem(fullProblem);
    await loadTags();
  };

  const handleSaveCapacity = async (newCapacity) => {
    await api.updateSettings('daily_capacity', newCapacity);
    await loadData();
  };

  return (
    <div className="min-h-screen text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddProblem={() => setShowAddForm(true)}
        onOpenSettings={() => setShowSettings(true)}
        stats={stats}
        isMidnight={isMidnight}
        onToggleTheme={toggleTheme}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-8">
        {loading && !practiceSession ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
            <p className="text-sm font-semibold text-slate-400">Loading SQL Manager Workspace...</p>
          </div>
        ) : (
          <>
            {activeTab === 'practice' && (
              <PracticeView
                practiceSession={practiceSession}
                completedMap={completedMap}
                onAttemptProblem={(prob, type) => setAttemptingProblem({ problem: prob, type })}
                onAttemptExternal={(slot) => setAttemptingExternal(slot)}
                onViewProblemDetails={async (id) => {
                  const fullProb = await api.getProblem(id);
                  setSelectedProblem(fullProb);
                }}
                onRefresh={handleRefreshPractice}
                onOpenSettings={() => setShowSettings(true)}
              />
            )}

            {activeTab === 'problems' && (
              <ProblemList
                problems={problems}
                tags={tags}
                filters={filters}
                setFilters={setFilters}
                onViewProblemDetails={async (id) => {
                  const fullProb = await api.getProblem(id);
                  setSelectedProblem(fullProb);
                }}
                onAttemptProblem={(prob, type) => setAttemptingProblem({ problem: prob, type })}
                onEditProblem={(prob) => setProblemToEdit(prob)}
                onDeleteProblem={handleDeleteProblem}
                onOpenAddProblem={() => setShowAddForm(true)}
              />
            )}

            {activeTab === 'stats' && (
              <StatsView
                stats={stats}
                onRefresh={async () => {
                  const data = await api.getStats();
                  setStats(data);
                }}
              />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-6 text-center text-xs text-slate-400 backdrop-blur-md bg-black/20">
        <p className="flex items-center justify-center space-x-2">
          <span>Personal SQL Practice Manager</span>
          <span>•</span>
          <span>Adaptive SRS & Generalization Tracker</span>
        </p>
      </footer>

      {/* MODALS */}
      {selectedProblem && (
        <ProblemDetailModal
          problem={selectedProblem}
          availableTags={tags}
          onClose={() => setSelectedProblem(null)}
          onRefreshProblem={handleRefreshProblemDetail}
          onAttemptProblem={(prob, type) => {
            setSelectedProblem(null);
            setAttemptingProblem({ problem: prob, type });
          }}
          onTagCreated={loadTags}
        />
      )}

      {(showAddForm || problemToEdit) && (
        <ProblemFormModal
          problem={problemToEdit}
          availableTags={tags}
          onClose={() => {
            setShowAddForm(false);
            setProblemToEdit(null);
          }}
          onSave={handleSaveProblem}
          onTagCreated={loadTags}
          onViewExistingProblem={async (id) => {
            const fullProb = await api.getProblem(id);
            setSelectedProblem(fullProb);
          }}
        />
      )}

      {attemptingProblem && (
        <AttemptModal
          problem={attemptingProblem.problem}
          attemptType={attemptingProblem.type}
          onClose={() => setAttemptingProblem(null)}
          onSubmit={handleRecordDatabaseAttempt}
        />
      )}

      {attemptingExternal && (
        <ExternalSlotModal
          slot={attemptingExternal}
          availableTags={tags}
          onClose={() => setAttemptingExternal(null)}
          onSubmit={handleRecordExternalAttempt}
          onTagCreated={loadTags}
        />
      )}

      {showSettings && (
        <SettingsModal
          currentCapacity={stats?.overview?.dailyCapacity || 5}
          onClose={() => setShowSettings(false)}
          onSave={handleSaveCapacity}
        />
      )}
    </div>
  );
}
