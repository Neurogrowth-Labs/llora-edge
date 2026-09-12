import React, { useState, useEffect } from 'react';
import {
  Search,
  Sparkles,
  Command,
  Layers,
  Box,
  Leaf,
  Activity,
  FileText,
  DollarSign,
  Compass,
  ArrowRight,
  HelpCircle,
  TrendingUp,
  ShieldAlert,
} from 'lucide-react';
import { ArchitecturalProject } from '../types/architecture';
import { queryBuildingSemantics } from '../services/buildingIntelligenceEngine';
import { executeAiAction } from '../services/aiActionsExecutor';

interface CommandCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: ArchitecturalProject;
  setProject: React.Dispatch<React.SetStateAction<ArchitecturalProject>>;
  onNavigateTab: (tab: any) => void;
  onOpenDesignReview: () => void;
  onOpenDesignDna: () => void;
}

export const CommandCenterModal: React.FC<CommandCenterModalProps> = ({
  isOpen,
  onClose,
  project,
  setProject,
  onNavigateTab,
  onOpenDesignReview,
  onOpenDesignDna,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [semanticAnswer, setSemanticAnswer] = useState<{ answer: string; keyMetric?: string } | null>(null);
  const [isExecutingAi, setIsExecutingAi] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);

  // Reset when opened
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setSemanticAnswer(null);
      setAiFeedback(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    // Check if it is a question for "Ask the Building"
    const isQuestion =
      searchQuery.includes('?') ||
      searchQuery.toLowerCase().startsWith('how') ||
      searchQuery.toLowerCase().startsWith('what') ||
      searchQuery.toLowerCase().startsWith('which') ||
      searchQuery.toLowerCase().startsWith('find') ||
      searchQuery.toLowerCase().startsWith('why');

    if (isQuestion) {
      const result = queryBuildingSemantics(project, searchQuery);
      setSemanticAnswer(result);
      setAiFeedback(null);
    } else {
      // Execute as Design Action
      handleExecuteCommand(searchQuery);
    }
  };

  const handleExecuteCommand = (commandText: string) => {
    setIsExecutingAi(true);
    setSemanticAnswer(null);
    setTimeout(() => {
      const { updatedProject, actionLog } = executeAiAction(project, commandText);
      setProject(updatedProject);
      setAiFeedback(`Executed: ${actionLog.title} (${actionLog.explanation.whatChanged})`);
      setIsExecutingAi(false);
    }, 400);
  };

  const quickQuestions = [
    'How large is the building?',
    'What rooms are under 12 m²?',
    'Which façade receives the most solar exposure?',
    'How can I reduce water consumption?',
    'Find all rooms without adequate daylight',
    'Which option is cheapest?',
  ];

  const quickActions = [
    { label: 'Optimize Western Façade Shading & Low-E Glass', prompt: 'Optimize western facade with vertical louvers and double Low-E glazing for Cape Town climate' },
    { label: 'Add Ensuite Bathroom to Master Suite', prompt: 'Add ensuite bathroom to master bedroom' },
    { label: 'Make Master Bedroom 20% Larger', prompt: 'Make master bedroom 20% larger' },
    { label: 'Add Upper Floor (Level 1)', prompt: 'Add another floor level for upper bedrooms' },
    { label: 'Reduce Construction Cost via Value Engineering', prompt: 'Reduce construction cost by 10% through modular standardization' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[#0D0D0D] border border-[#262626] rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Search Bar Input */}
        <form onSubmit={handleSearchSubmit} className="p-4 border-b border-[#222] flex items-center gap-3 bg-[#141414]">
          <Search className="w-5 h-5 text-[#2DD4BF] shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Ask the building or give Design architectural commands (e.g. 'What rooms are under 12m²?' or 'Make bedroom 20% larger')..."
            className="w-full bg-transparent text-sm text-white placeholder-gray-500 focus:outline-none"
            autoFocus
          />
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#222] text-[10px] font-mono text-gray-400 border border-[#333]">
            <Command className="w-3 h-3" />
            <span>K</span>
          </div>
        </form>

        {/* Content Body */}
        <div className="p-4 overflow-y-auto space-y-5 text-xs text-[#CCCCCC]">
          {/* Design Semantic Answer Box if Question was asked */}
          {semanticAnswer && (
            <div className="p-3.5 bg-[#17252A]/90 border border-[#2DD4BF]/40 rounded-lg space-y-2 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#2DD4BF] font-semibold text-xs">
                  <Sparkles className="w-4 h-4" />
                  <span>Building Intelligence Query Result</span>
                </div>
                {semanticAnswer.keyMetric && (
                  <span className="px-2 py-0.5 bg-[#2DD4BF]/20 text-[#2DD4BF] text-[11px] font-bold rounded">
                    {semanticAnswer.keyMetric}
                  </span>
                )}
              </div>
              <p className="text-[#E0E0E0] whitespace-pre-line leading-relaxed text-xs">
                {semanticAnswer.answer}
              </p>
            </div>
          )}

          {/* Design Feedback Box if Action was executed */}
          {aiFeedback && (
            <div className="p-3 bg-[#14532D]/40 border border-green-500/40 rounded-lg text-green-300 text-xs flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-green-400 shrink-0" />
              <span>{aiFeedback}</span>
            </div>
          )}

          {/* "Ask the Building" Semantic Questions */}
          <div>
            <div className="flex items-center gap-2 text-gray-400 font-semibold mb-2.5 uppercase tracking-wider text-[11px]">
              <HelpCircle className="w-3.5 h-3.5 text-[#2DD4BF]" />
              <span>Ask the Building (Live Semantics)</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {quickQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSearchQuery(q);
                    const res = queryBuildingSemantics(project, q);
                    setSemanticAnswer(res);
                    setAiFeedback(null);
                  }}
                  className="text-left p-2.5 bg-[#141414] hover:bg-[#1E1E1E] border border-[#262626] hover:border-[#2DD4BF]/50 rounded-md transition flex items-center justify-between group text-gray-300 hover:text-white"
                >
                  <span className="truncate pr-2">{q}</span>
                  <ArrowRight className="w-3 h-3 text-gray-600 group-hover:text-[#2DD4BF] shrink-0" />
                </button>
              ))}
            </div>
          </div>

          {/* Quick Design Architectural Actions */}
          <div>
            <div className="flex items-center gap-2 text-gray-400 font-semibold mb-2.5 uppercase tracking-wider text-[11px]">
              <Sparkles className="w-3.5 h-3.5 text-[#2DD4BF]" />
              <span>Direct Design Architectural Actions (Modifies Model)</span>
            </div>
            <div className="space-y-1.5">
              {quickActions.map((action, idx) => (
                <button
                  key={idx}
                  disabled={isExecutingAi}
                  onClick={() => handleExecuteCommand(action.prompt)}
                  className="w-full text-left p-2.5 bg-[#141414] hover:bg-[#1A1A1A] border border-[#262626] hover:border-[#2DD4BF]/60 rounded-md transition flex items-center justify-between group"
                >
                  <span className="text-gray-300 group-hover:text-white font-medium">{action.label}</span>
                  <span className="text-[10px] px-2 py-0.5 bg-[#222] group-hover:bg-[#2DD4BF]/20 text-gray-400 group-hover:text-[#2DD4BF] rounded font-mono">
                    Execute
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Navigation Shortcuts */}
          <div>
            <div className="flex items-center gap-2 text-gray-400 font-semibold mb-2.5 uppercase tracking-wider text-[11px]">
              <Compass className="w-3.5 h-3.5 text-gray-400" />
              <span>Studio Navigation</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => { onNavigateTab('2d'); onClose(); }}
                className="p-2 bg-[#141414] hover:bg-[#1E1E1E] border border-[#262626] rounded flex items-center gap-2 text-gray-300"
              >
                <Layers className="w-3.5 h-3.5 text-[#2DD4BF]" />
                <span>2D Plan CAD</span>
              </button>
              <button
                onClick={() => { onNavigateTab('3d'); onClose(); }}
                className="p-2 bg-[#141414] hover:bg-[#1E1E1E] border border-[#262626] rounded flex items-center gap-2 text-gray-300"
              >
                <Box className="w-3.5 h-3.5 text-[#2DD4BF]" />
                <span>3D BIM Model</span>
              </button>
              <button
                onClick={() => { onNavigateTab('intelligence'); onClose(); }}
                className="p-2 bg-[#141414] hover:bg-[#1E1E1E] border border-[#262626] rounded flex items-center gap-2 text-gray-300"
              >
                <Activity className="w-3.5 h-3.5 text-[#2DD4BF]" />
                <span>Building Intelligence</span>
              </button>
              <button
                onClick={() => { onNavigateTab('sustainability'); onClose(); }}
                className="p-2 bg-[#141414] hover:bg-[#1E1E1E] border border-[#262626] rounded flex items-center gap-2 text-gray-300"
              >
                <Leaf className="w-3.5 h-3.5 text-[#2DD4BF]" />
                <span>EDGE Studio</span>
              </button>
              <button
                onClick={() => { onNavigateTab('developer'); onClose(); }}
                className="p-2 bg-[#141414] hover:bg-[#1E1E1E] border border-[#262626] rounded flex items-center gap-2 text-gray-300"
              >
                <TrendingUp className="w-3.5 h-3.5 text-[#2DD4BF]" />
                <span>Developer Pro-Forma</span>
              </button>
              <button
                onClick={() => { onNavigateTab('docs'); onClose(); }}
                className="p-2 bg-[#141414] hover:bg-[#1E1E1E] border border-[#262626] rounded flex items-center gap-2 text-gray-300"
              >
                <FileText className="w-3.5 h-3.5 text-[#2DD4BF]" />
                <span>Document Sheets</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-[#222] bg-[#0A0A0A] flex items-center justify-between text-[11px] text-gray-500">
          <span>Building: <strong className="text-gray-300">{project.name}</strong> ({project.climate.location})</span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => { onOpenDesignReview(); onClose(); }}
              className="text-[#f59e0b] hover:underline flex items-center gap-1"
            >
              <ShieldAlert className="w-3 h-3" />
              <span>Review Design</span>
            </button>
            <button
              onClick={() => { onOpenDesignDna(); onClose(); }}
              className="text-[#2DD4BF] hover:underline flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3" />
              <span>Design DNA</span>
            </button>
            <button onClick={onClose} className="hover:text-gray-300">
              [ESC] Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
