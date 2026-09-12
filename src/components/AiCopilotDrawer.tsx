import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  Bot,
  User,
  CheckCircle,
  Loader2,
  HelpCircle,
  AlertTriangle,
  RotateCcw,
  Check,
  X,
  Layers,
  Activity,
  ArrowRight,
  History,
  GitBranch,
  Edit2,
  Save,
  Clock,
  ArrowLeftRight,
  TrendingUp,
  TrendingDown,
  Building,
  DollarSign,
  Leaf,
  Sun,
  FileCheck,
} from 'lucide-react';
import {
  ArchitecturalProject,
  ExplainableDecision,
  DependencyImpact,
  VersionSnapshot,
} from '../types/architecture';
import { executeAiAction } from '../services/aiActionsExecutor';

interface AiCopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  project: ArchitecturalProject;
  setProject: React.Dispatch<React.SetStateAction<ArchitecturalProject>>;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  explanation?: ExplainableDecision;
  dependencies?: DependencyImpact[];
  appliedSnapshot?: any;
}

export const AiCopilotDrawer: React.FC<AiCopilotDrawerProps> = ({
  isOpen,
  onClose,
  project,
  setProject,
}) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'history'>('chat');
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [previousSnapshot, setPreviousSnapshot] = useState<ArchitecturalProject | null>(null);

  // Version History & Milestone Management
  const [editingMilestoneId, setEditingMilestoneId] = useState<string | null>(null);
  const [editingMilestoneName, setEditingMilestoneName] = useState<string>('');
  const [comparingSnapshots, setComparingSnapshots] = useState<{
    base: VersionSnapshot;
    compare: VersionSnapshot;
  } | null>(null);
  const [newMilestoneName, setNewMilestoneName] = useState<string>('');
  const [showCreateMilestone, setShowCreateMilestone] = useState<boolean>(false);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg_0',
      sender: 'assistant',
      text: `Hello! I am your Architectural Assistant. Unlike generic chatbots, I directly understand and modify your parametric BIM model. Give me natural language commands like:\n- "Make the master bedroom 20% larger"\n- "Add structural column to support clear span"\n- "Add ensuite bathroom to master bedroom"\n- "Optimize western façade for Cape Town climate"\n- "Reduce construction cost via modular layout"`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  if (!isOpen) return null;

  const currentScoreVal =
    typeof project.intelligenceScore === 'number'
      ? project.intelligenceScore
      : project.intelligenceScore?.overallScore || 85;

  // Initialize version history if empty
  const versionHistory: VersionSnapshot[] =
    project.versionHistory && project.versionHistory.length > 0
      ? project.versionHistory
      : [
          {
            id: 'ver_initial',
            versionNumber: 1,
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            name: 'Initial Concept Baseline',
            author: 'Lead Architect',
            changeSummary: 'Initial parametric floor plan setup and zoning layout',
            modelSnapshot: JSON.parse(JSON.stringify(project)),
            metrics: {
              floorAreaM2: project.rooms.reduce((s, r) => s + r.floorArea, 0),
              totalCostUSD: project.cost?.totalEstimatedCostUSD || 310000,
              energySavingsPct: project.sustainability?.energySavingsPct || 42,
              waterSavingsPct: project.sustainability?.waterSavingsPct || 40,
              intelligenceScore: currentScoreVal,
              roomCount: project.rooms.length,
              wallCount: project.walls.length,
            },
          },
        ];

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputMessage.trim();
    if (!query || isLoading) return;

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    // Save snapshot for potential undo/reject and version history
    const currentClone = JSON.parse(JSON.stringify(project));
    setPreviousSnapshot(currentClone);

    setTimeout(() => {
      // Execute structured Design Action modifying the real building model
      const { updatedProject, actionLog } = executeAiAction(project, query);

      const scoreVal =
        typeof updatedProject.intelligenceScore === 'number'
          ? updatedProject.intelligenceScore
          : updatedProject.intelligenceScore?.overallScore || 86;

      // Create new version history snapshot automatically
      const newSnapshot: VersionSnapshot = {
        id: `ver_${Date.now()}`,
        versionNumber: (project.versionHistory?.length || versionHistory.length) + 1,
        timestamp: new Date().toISOString(),
        name: `Design Action: ${actionLog.title}`,
        author: 'Design Assistant (Lora)',
        changeSummary: actionLog.explanation.whatChanged,
        modelSnapshot: JSON.parse(JSON.stringify(updatedProject)),
        metrics: {
          floorAreaM2: updatedProject.rooms.reduce((s, r) => s + r.floorArea, 0),
          totalCostUSD: updatedProject.cost?.totalEstimatedCostUSD || 310000,
          energySavingsPct: updatedProject.sustainability?.energySavingsPct || 42,
          waterSavingsPct: updatedProject.sustainability?.waterSavingsPct || 40,
          intelligenceScore: scoreVal,
          roomCount: updatedProject.rooms.length,
          wallCount: updatedProject.walls.length,
        },
      };

      const newHistory = [newSnapshot, ...(project.versionHistory || versionHistory)];
      const finalProject = { ...updatedProject, versionHistory: newHistory };

      setProject(finalProject);

      const aiMsg: ChatMessage = {
        id: `ai_${Date.now()}`,
        sender: 'assistant',
        text: `I have updated the architectural building model per your instruction: "${query}".`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        explanation: actionLog.explanation,
        dependencies: actionLog.dependencies,
        appliedSnapshot: previousSnapshot,
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsLoading(false);
    }, 450);
  };

  const handleRejectAndRevert = () => {
    if (previousSnapshot) {
      setProject(previousSnapshot);
      const revertMsg: ChatMessage = {
        id: `rev_${Date.now()}`,
        sender: 'assistant',
        text: 'Action reverted. The building model has been restored to its previous state.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, revertMsg]);
      setPreviousSnapshot(null);
    }
  };

  const handleAcceptDesign = () => {
    setPreviousSnapshot(null);
    setMessages((prev) => [
      ...prev,
      {
        id: `ack_${Date.now()}`,
        sender: 'assistant',
        text: 'Design change accepted and retained in the project timeline.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  // Version History Operations
  const handleRestoreVersion = (snapshot: VersionSnapshot) => {
    if (window.confirm(`Restore project to milestone: "${snapshot.name}"?`)) {
      const restored = snapshot.modelSnapshot
        ? JSON.parse(JSON.stringify(snapshot.modelSnapshot))
        : JSON.parse(JSON.stringify(project));
      // Keep version history intact
      restored.versionHistory = project.versionHistory || versionHistory;
      setProject(restored);

      const restoreMsg: ChatMessage = {
        id: `rst_${Date.now()}`,
        sender: 'assistant',
        text: `Project design restored to milestone: "${snapshot.name}".`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, restoreMsg]);
      setActiveTab('chat');
    }
  };

  const handleSaveMilestone = () => {
    if (!newMilestoneName.trim()) return;

    const milestoneSnapshot: VersionSnapshot = {
      id: `milestone_${Date.now()}`,
      versionNumber: (project.versionHistory?.length || versionHistory.length) + 1,
      timestamp: new Date().toISOString(),
      name: newMilestoneName.trim(),
      author: 'Architect (Manual Milestone)',
      changeSummary: 'User-created design milestone checkpoint',
      modelSnapshot: JSON.parse(JSON.stringify(project)),
      metrics: {
        floorAreaM2: project.rooms.reduce((s, r) => s + r.floorArea, 0),
        totalCostUSD: project.cost?.totalEstimatedCostUSD || 310000,
        energySavingsPct: project.sustainability?.energySavingsPct || 42,
        waterSavingsPct: project.sustainability?.waterSavingsPct || 40,
        intelligenceScore: currentScoreVal,
        roomCount: project.rooms.length,
        wallCount: project.walls.length,
      },
    };

    const updatedHistory = [milestoneSnapshot, ...(project.versionHistory || versionHistory)];
    setProject({ ...project, versionHistory: updatedHistory });
    setNewMilestoneName('');
    setShowCreateMilestone(false);
  };

  const handleRenameMilestone = (id: string) => {
    if (!editingMilestoneName.trim()) return;

    const updatedHistory = (project.versionHistory || versionHistory).map((ver) =>
      ver.id === id ? { ...ver, name: editingMilestoneName.trim() } : ver
    );

    setProject({ ...project, versionHistory: updatedHistory });
    setEditingMilestoneId(null);
    setEditingMilestoneName('');
  };

  const quickPrompts = [
    'Make master bedroom 20% larger',
    'Add structural column to support clear span',
    'Add ensuite bathroom to master bedroom',
    'Optimize western facade with vertical louvers for EDGE',
    'Reduce construction cost via modular standardization',
  ];

  return (
    <div className="fixed inset-y-0 right-0 w-[460px] bg-[#0A0A0A] border-l border-[#222222] shadow-2xl z-50 flex flex-col text-[#E0E0E0] animate-in slide-in-from-right duration-300">
      {/* Header with Tabs */}
      <div className="p-4 border-b border-[#222222] flex flex-col gap-3 bg-[#0E0E0E]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white tracking-tight">Architectural Assistant</h2>
                <span className="px-1.5 py-0.5 bg-[#2DD4BF]/20 text-[#2DD4BF] text-[9px] font-mono rounded">
                  Live BIM
                </span>
              </div>
              <span className="text-[11px] text-gray-400">
                Direct parametric model manipulation & design timeline
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-white rounded hover:bg-[#222] transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher: Chat vs Version History */}
        <div className="flex bg-[#141414] p-1 rounded-lg border border-[#222] text-xs">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex-1 py-1.5 rounded-md font-semibold flex items-center justify-center gap-1.5 transition ${
              activeTab === 'chat'
                ? 'bg-[#262626] text-[#2DD4BF] shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <span>Assistant Chat</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-1.5 rounded-md font-semibold flex items-center justify-center gap-1.5 transition ${
              activeTab === 'history'
                ? 'bg-[#262626] text-[#2DD4BF] shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Version History ({versionHistory.length})</span>
          </button>
        </div>
      </div>

      {/* TAB 1: Design COPILOT CHAT */}
      {activeTab === 'chat' && (
        <>
          {/* Messages List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col gap-1.5 ${
                  msg.sender === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div className="flex items-center gap-1 text-[10px] text-gray-500 font-mono">
                  {msg.sender === 'user' ? (
                    <span>Architect</span>
                  ) : (
                    <span>Lora Design Building Brain</span>
                  )}
                  <span>•</span>
                  <span>{msg.timestamp}</span>
                </div>

                <div
                  className={`p-3.5 rounded-lg max-w-[95%] leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-[#1C2826] text-white border border-[#2DD4BF]/40 font-medium'
                      : 'bg-[#141414] text-[#D1D5DB] border border-[#262626]'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>

                  {/* EXPLAINABLE Design "WHY?" CARD */}
                  {msg.explanation && (
                    <div className="mt-3 pt-3 border-t border-[#262626] space-y-2 text-[11px]">
                      <div className="flex items-center justify-between text-[#2DD4BF] font-bold">
                        <span className="flex items-center gap-1.5">
                          <HelpCircle className="w-3.5 h-3.5" />
                          <span>Why This Change Was Made:</span>
                        </span>
                        <span className="text-[10px] font-mono text-gray-400">Action: {msg.explanation.title}</span>
                      </div>

                      <div className="space-y-1.5 text-gray-300 bg-[#0A0A0A] p-2.5 rounded border border-[#222]">
                        <div>
                          <strong className="text-white block">What Changed:</strong>
                          <span className="text-gray-400">{msg.explanation.whatChanged}</span>
                        </div>
                        <div>
                          <strong className="text-white block">Why It Changed:</strong>
                          <span className="text-gray-400">{msg.explanation.whyItChanged}</span>
                        </div>
                        <div>
                          <strong className="text-white block">Expected Benefit:</strong>
                          <span className="text-green-400">{msg.explanation.expectedBenefit}</span>
                        </div>
                        {msg.explanation.possibleTradeoffs && (
                          <div>
                            <strong className="text-white block">Possible Trade-offs:</strong>
                            <span className="text-amber-400">{msg.explanation.possibleTradeoffs}</span>
                          </div>
                        )}
                      </div>

                      {/* Dependency Badges */}
                      {msg.dependencies && msg.dependencies.length > 0 && (
                        <div className="pt-1">
                          <span className="text-[10px] uppercase font-semibold text-gray-500 block mb-1">
                            Dependent Systems Evaluated ({msg.dependencies.length})
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {msg.dependencies.slice(0, 3).map((dep, idx) => (
                              <span
                                key={idx}
                                className="px-1.5 py-0.5 bg-[#1C1C1C] border border-[#333] text-[9px] text-gray-300 rounded"
                              >
                                {dep.affectedSystem}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Decision Controls: Accept / Reject */}
                      <div className="pt-2 flex items-center gap-2">
                        <button
                          onClick={handleAcceptDesign}
                          className="px-3 py-1 bg-[#14532D]/40 hover:bg-[#14532D]/70 border border-green-500/40 rounded text-green-300 font-semibold text-[10px] flex items-center gap-1 transition"
                        >
                          <Check className="w-3 h-3" />
                          <span>Accept Design</span>
                        </button>
                        <button
                          onClick={handleRejectAndRevert}
                          className="px-3 py-1 bg-[#7F1D1D]/30 hover:bg-[#7F1D1D]/60 border border-red-500/40 rounded text-red-300 font-semibold text-[10px] flex items-center gap-1 transition"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Reject & Revert</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-2 text-gray-400 text-xs p-3 bg-[#141414] border border-[#222] rounded-lg animate-pulse">
                <Loader2 className="w-4 h-4 animate-spin text-[#2DD4BF]" />
                <span>Reasoning, building geometry & validating dependencies...</span>
              </div>
            )}
          </div>

          {/* Quick Prompts */}
          <div className="p-3 border-t border-[#222] bg-[#0E0E0E] space-y-1.5">
            <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider block">
              Architectural Quick Commands
            </span>
            <div className="flex flex-wrap gap-1.5">
              {quickPrompts.slice(0, 3).map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(prompt)}
                  className="text-[11px] px-2.5 py-1 bg-[#1A1A1A] hover:bg-[#252525] border border-[#333] hover:border-[#2DD4BF]/50 rounded text-gray-300 hover:text-white transition truncate max-w-full"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          {/* Input Area */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 border-t border-[#222] bg-[#121212] flex gap-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Give architectural command (e.g. 'Add column to support span')..."
              className="flex-1 bg-[#1A1A1A] border border-[#333] rounded px-3 py-2 text-xs text-white placeholder-gray-500 focus:border-[#2DD4BF] focus:outline-none"
            />
            <button
              type="submit"
              disabled={isLoading || !inputMessage.trim()}
              className="p-2 bg-[#2DD4BF] hover:bg-[#22bca6] disabled:opacity-50 text-black font-bold rounded transition shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </>
      )}

      {/* TAB 2: VERSION HISTORY & MILESTONE SIDE-PANEL */}
      {activeTab === 'history' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Bar for Creating New Milestone */}
          <div className="p-3 border-b border-[#222] bg-[#111111] flex items-center justify-between">
            <span className="text-xs text-gray-400 font-semibold">
              Project Snapshots & Milestones
            </span>
            <button
              onClick={() => setShowCreateMilestone((s) => !s)}
              className="px-2.5 py-1 bg-[#2DD4BF] hover:bg-[#22bca6] text-black font-bold text-xs rounded transition flex items-center gap-1 shadow-sm"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Milestone</span>
            </button>
          </div>

          {/* New Milestone Input form */}
          {showCreateMilestone && (
            <div className="p-3 bg-[#141E1C] border-b border-[#2DD4BF]/30 space-y-2 animate-in fade-in">
              <span className="text-[11px] font-bold text-[#2DD4BF] block">
                Create Named Milestone Snapshot
              </span>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMilestoneName}
                  onChange={(e) => setNewMilestoneName(e.target.value)}
                  placeholder="e.g., 'Schematic Design Approval', 'Client Option B'..."
                  className="flex-1 bg-[#0A0A0A] border border-[#333] rounded px-2.5 py-1.5 text-xs text-white placeholder-gray-500 focus:border-[#2DD4BF] focus:outline-none"
                  autoFocus
                />
                <button
                  onClick={handleSaveMilestone}
                  disabled={!newMilestoneName.trim()}
                  className="px-3 py-1.5 bg-[#2DD4BF] hover:bg-[#22bca6] disabled:opacity-50 text-black font-bold text-xs rounded transition"
                >
                  Save
                </button>
                <button
                  onClick={() => setShowCreateMilestone(false)}
                  className="px-2 py-1.5 bg-[#222] text-gray-400 hover:text-white rounded text-xs"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Snapshot Comparison Modal / Drawer Overlay */}
          {comparingSnapshots && (
            <div className="p-4 bg-[#141414] border-b border-[#333] space-y-3 animate-in fade-in text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[#2DD4BF] font-bold">
                  <ArrowLeftRight className="w-4 h-4" />
                  <span>Comparing Snapshot Delta</span>
                </div>
                <button
                  onClick={() => setComparingSnapshots(null)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2.5 bg-[#0D0D0D] rounded border border-[#262626] space-y-1">
                  <span className="text-gray-400 font-mono text-[10px] block truncate">
                    [Base] {comparingSnapshots.base.name}
                  </span>
                  <div className="text-white font-bold">
                    Area: {comparingSnapshots.base.metrics?.floorAreaM2.toFixed(1) || '—'} m²
                  </div>
                  <div className="text-gray-400">
                    Cost: ${(comparingSnapshots.base.metrics?.totalCostUSD || 0).toLocaleString()}
                  </div>
                  <div className="text-green-400">
                    Energy Savings: +{comparingSnapshots.base.metrics?.energySavingsPct || 0}%
                  </div>
                </div>

                <div className="p-2.5 bg-[#0D0D0D] rounded border border-[#262626] space-y-1">
                  <span className="text-[#2DD4BF] font-mono text-[10px] block truncate">
                    [Current] {comparingSnapshots.compare.name}
                  </span>
                  <div className="text-white font-bold">
                    Area: {comparingSnapshots.compare.metrics?.floorAreaM2.toFixed(1) || '—'} m²
                  </div>
                  <div className="text-gray-400">
                    Cost: ${(comparingSnapshots.compare.metrics?.totalCostUSD || 0).toLocaleString()}
                  </div>
                  <div className="text-green-400">
                    Energy Savings: +{comparingSnapshots.compare.metrics?.energySavingsPct || 0}%
                  </div>
                </div>
              </div>

              {/* Delta Calculations */}
              {comparingSnapshots.base.metrics && comparingSnapshots.compare.metrics && (
                <div className="p-2.5 bg-[#0A0A0A] rounded border border-[#222] space-y-1 text-[11px] font-mono">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Area Delta:</span>
                    <span
                      className={
                        comparingSnapshots.compare.metrics.floorAreaM2 >= comparingSnapshots.base.metrics.floorAreaM2
                          ? 'text-green-400 font-bold'
                          : 'text-amber-400 font-bold'
                      }
                    >
                      {(
                        comparingSnapshots.compare.metrics.floorAreaM2 -
                        comparingSnapshots.base.metrics.floorAreaM2
                      ).toFixed(1)}{' '}
                      m²
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Cost Delta:</span>
                    <span
                      className={
                        comparingSnapshots.compare.metrics.totalCostUSD <= comparingSnapshots.base.metrics.totalCostUSD
                          ? 'text-green-400 font-bold'
                          : 'text-red-400 font-bold'
                      }
                    >
                      ${(
                        comparingSnapshots.compare.metrics.totalCostUSD -
                        comparingSnapshots.base.metrics.totalCostUSD
                      ).toLocaleString()}{' '}
                      USD
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Timeline List of Snapshots */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
            {versionHistory.map((snapshot, idx) => (
              <div
                key={snapshot.id}
                className="p-3.5 bg-[#121212] border border-[#222] hover:border-[#333] rounded-xl space-y-2 transition"
              >
                {/* Milestone Header & Rename Controls */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    {editingMilestoneId === snapshot.id ? (
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          value={editingMilestoneName}
                          onChange={(e) => setEditingMilestoneName(e.target.value)}
                          className="bg-[#0A0A0A] border border-[#2DD4BF] rounded px-2 py-0.5 text-xs text-white focus:outline-none flex-1"
                          autoFocus
                        />
                        <button
                          onClick={() => handleRenameMilestone(snapshot.id)}
                          className="p-1 bg-[#2DD4BF] text-black rounded"
                        >
                          <Check className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => setEditingMilestoneId(null)}
                          className="p-1 bg-[#222] text-gray-400 rounded"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-white text-xs truncate">{snapshot.name}</span>
                        <button
                          onClick={() => {
                            setEditingMilestoneId(snapshot.id);
                            setEditingMilestoneName(snapshot.name);
                          }}
                          className="p-1 text-gray-500 hover:text-white transition"
                          title="Rename milestone"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-[10px] text-gray-500 font-mono mt-0.5">
                      <span>{new Date(snapshot.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <span>•</span>
                      <span>{snapshot.author}</span>
                    </div>
                  </div>

                  {idx === 0 && (
                    <span className="px-1.5 py-0.5 bg-[#2DD4BF]/20 text-[#2DD4BF] text-[9px] font-bold rounded">
                      Current
                    </span>
                  )}
                </div>

                {/* Change Summary */}
                {snapshot.changeSummary && (
                  <p className="text-[11px] text-gray-400 leading-relaxed bg-[#0A0A0A] p-2 rounded border border-[#1A1A1A]">
                    {snapshot.changeSummary}
                  </p>
                )}

                {/* Metrics Badges */}
                {snapshot.metrics && (
                  <div className="flex items-center gap-2 text-[10px] font-mono text-gray-400 pt-1">
                    <span className="px-1.5 py-0.5 bg-[#171717] rounded border border-[#262626]">
                      {snapshot.metrics.floorAreaM2.toFixed(0)} m²
                    </span>
                    <span className="px-1.5 py-0.5 bg-[#171717] rounded border border-[#262626]">
                      ${(snapshot.metrics.totalCostUSD / 1000).toFixed(0)}k
                    </span>
                    <span className="px-1.5 py-0.5 bg-[#171717] rounded border border-[#262626] text-green-400">
                      +{snapshot.metrics.energySavingsPct}% EDGE
                    </span>
                  </div>
                )}

                {/* Action Buttons: Compare & Restore */}
                <div className="pt-2 border-t border-[#1C1C1C] flex items-center justify-between gap-2">
                  <button
                    onClick={() =>
                      setComparingSnapshots({
                        base: snapshot,
                        compare: versionHistory[0],
                      })
                    }
                    className="px-2.5 py-1 bg-[#1A1A1A] hover:bg-[#252525] text-gray-300 hover:text-white rounded text-[11px] font-semibold flex items-center gap-1 transition"
                  >
                    <ArrowLeftRight className="w-3 h-3 text-[#2DD4BF]" />
                    <span>Compare with Current</span>
                  </button>

                  <button
                    onClick={() => handleRestoreVersion(snapshot)}
                    className="px-2.5 py-1 bg-[#2DD4BF]/20 hover:bg-[#2DD4BF] text-[#2DD4BF] hover:text-black rounded text-[11px] font-bold flex items-center gap-1 transition border border-[#2DD4BF]/40"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Restore State</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
