import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  Bot,
  User,
  Compass,
  Layers,
  MapPin,
  Hammer,
  Recycle,
  ShieldAlert,
  Activity,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Zap,
  Terminal,
  Building,
  Calendar,
  Leaf,
  Boxes,
  HelpCircle,
} from 'lucide-react';
import { ArchitecturalProject } from '../types/architecture';
import { SpatialAgentRole } from '../types/digitalTwin';
import { SPATIAL_AI_AGENTS } from '../data/digitalTwinData';
import { interpretSpatialCopilotQuery } from '../services/spatialCopilotEngine';

interface SpatialCopilotProps {
  project: ArchitecturalProject;
  setProject: React.Dispatch<React.SetStateAction<ArchitecturalProject>>;
  onOpenDigitalTwin?: () => void;
  onOpenDemolitionStudio?: () => void;
  onOpenMaterialScanner?: () => void;
  isEmbedded?: boolean;
  onClose?: () => void;
}

interface CopilotInteraction {
  id: string;
  sender: 'user' | 'agent';
  agentRole?: SpatialAgentRole;
  text: string;
  cadActionSummary?: string;
  suggestedFollowUps?: string[];
  timestamp: string;
  confidenceScore?: number;
}

export const SpatialCopilot: React.FC<SpatialCopilotProps> = ({
  project,
  setProject,
  onOpenDigitalTwin,
  onOpenDemolitionStudio,
  onOpenMaterialScanner,
  isEmbedded = false,
  onClose,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [selectedAgentRole, setSelectedAgentRole] = useState<SpatialAgentRole | 'ALL'>('ALL');
  const [queryInput, setQueryInput] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const [interactions, setInteractions] = useState<CopilotInteraction[]>([
    {
      id: 'init_1',
      sender: 'agent',
      agentRole: 'ARCHITECT_AGENT',
      text: `LORA Spatial Copilot connected to Living Digital Twin (BIM + GIS + IoT + Robotics). I directly understand spatial coordinates and execute Natural Language CAD commands.`,
      cadActionSummary: `Live Twin active: ${project.walls.length} BIM walls, 4 autonomous robots online, and real-time site GIS synced.`,
      suggestedFollowUps: [
        'Show me all buildings scheduled for demolition within 2 km',
        'Which buildings contain the highest estimated recyclable steel?',
        'Calculate the potential recovery value of this site',
        'Find conflicts between the demolition plan and robot operating zones',
        'Create a demolition plan for Building B-104',
        'Create a 20m × 30m building footprint',
      ],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      confidenceScore: 0.99,
    },
  ]);

  const activeAgent = SPATIAL_AI_AGENTS.find((a) => a.id === selectedAgentRole) || SPATIAL_AI_AGENTS[0];

  const handleExecuteQuery = (textToSend?: string) => {
    const query = textToSend || queryInput.trim();
    if (!query || isProcessing) return;

    setIsProcessing(true);

    const userMessage: CopilotInteraction = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setInteractions((prev) => [...prev, userMessage]);
    if (!textToSend) setQueryInput('');

    setTimeout(() => {
      const result = interpretSpatialCopilotQuery(query, project);

      if (result.updatedProject) {
        setProject(result.updatedProject);
      }

      const agentMessage: CopilotInteraction = {
        id: `agent_${Date.now()}`,
        sender: 'agent',
        agentRole: result.interpretation.agentRole,
        text: result.interpretation.explanation,
        cadActionSummary: result.cadActionSummary,
        suggestedFollowUps: result.suggestedFollowUps,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        confidenceScore: result.interpretation.confidenceScore,
      };

      setInteractions((prev) => [...prev, agentMessage]);
      setIsProcessing(false);
    }, 450);
  };

  return (
    <div
      className={
        isEmbedded
          ? 'w-full flex-1 flex flex-col bg-[#0A0A0A] overflow-hidden min-h-0'
          : `fixed bottom-12 right-6 z-40 bg-[#0C0C0C]/95 backdrop-blur-xl border border-[#262626] rounded-2xl shadow-2xl transition-all duration-300 flex flex-col overflow-hidden ${
              isExpanded ? 'w-96 md:w-[460px] h-[580px]' : 'w-72 h-12'
            }`
      }
    >
      {/* Header Bar */}
      <div className="px-3.5 py-2 bg-gradient-to-r from-[#121212] via-[#161616] to-[#0E1716] border-b border-[#222222] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-[#2DD4BF] flex items-center justify-center text-black shadow-md shadow-[#2DD4BF]/20">
            <Sparkles className="w-3 h-3" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-black text-white tracking-wide">SPATIAL COPILOT</span>
              <span className="px-1.5 py-0.2 bg-[#2DD4BF]/20 text-[#2DD4BF] text-[8px] font-bold rounded font-mono">
                CAD + TWIN
              </span>
            </div>
            {(isExpanded || isEmbedded) && (
              <div className="text-[9px] text-gray-400 flex items-center gap-1">
                <span>9 Spatial Agents</span>
                <span>•</span>
                <span className="text-[#10B981] font-mono">BIM Live</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1">
          {onOpenDigitalTwin && (
            <button
              onClick={onOpenDigitalTwin}
              className="px-1.5 py-0.5 bg-[#1C1C1C] hover:bg-[#252525] border border-[#303030] text-[#2DD4BF] rounded text-[9px] font-bold transition flex items-center gap-1"
              title="Open Living Digital Twin Studio"
            >
              <Activity className="w-2.5 h-2.5" />
              <span className="hidden sm:inline">Twin</span>
            </button>
          )}
          {!isEmbedded && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 hover:bg-[#202020] text-gray-400 hover:text-white rounded transition text-xs font-mono"
              title={isExpanded ? 'Minimize Spatial Copilot' : 'Expand Spatial Copilot'}
            >
              {isExpanded ? '▼' : '▲'}
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 hover:bg-[#202020] text-gray-400 hover:text-white rounded transition text-xs font-mono"
              title="Close"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {(isExpanded || isEmbedded) && (
        <>
          {/* Spatial Agent Switcher Strip */}
          <div className="px-3 py-1.5 bg-[#090909] border-b border-[#1A1A1A] flex items-center gap-1.5 overflow-x-auto scrollbar-none text-[10px]">
            <button
              onClick={() => setSelectedAgentRole('ALL')}
              className={`px-2 py-0.5 rounded-full font-bold transition shrink-0 ${
                selectedAgentRole === 'ALL'
                  ? 'bg-[#2DD4BF] text-black shadow-sm'
                  : 'bg-[#181818] text-gray-400 hover:text-gray-200'
              }`}
            >
              All Agents (Auto)
            </button>
            {SPATIAL_AI_AGENTS.map((agent) => (
              <button
                key={agent.id}
                onClick={() => setSelectedAgentRole(agent.id)}
                className={`px-2 py-0.5 rounded-full font-medium transition shrink-0 flex items-center gap-1 ${
                  selectedAgentRole === agent.id
                    ? 'bg-[#202020] text-white border border-[#333]'
                    : 'bg-[#121212] text-gray-400 hover:text-gray-200'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: agent.color }} />
                <span>{agent.shortTitle.replace(' Agent', '')}</span>
              </button>
            ))}
          </div>

          {/* Chat Messages Feed */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3 font-sans text-xs">
            {interactions.map((msg) => {
              const isUser = msg.sender === 'user';
              const agentDetails = SPATIAL_AI_AGENTS.find((a) => a.id === msg.agentRole) || activeAgent;

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} animate-in fade-in duration-150`}
                >
                  <div className="flex items-center gap-1.5 mb-1 px-1">
                    {!isUser && (
                      <div
                        className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-black"
                        style={{ backgroundColor: agentDetails.color }}
                      >
                        {agentDetails.shortTitle[0]}
                      </div>
                    )}
                    <span className="text-[10px] font-bold text-gray-400">
                      {isUser ? 'Architect' : agentDetails.name}
                    </span>
                    <span className="text-[9px] text-gray-600 font-mono">{msg.timestamp}</span>
                    {msg.confidenceScore && (
                      <span className="text-[9px] text-[#2DD4BF] font-mono font-bold">
                        {(msg.confidenceScore * 100).toFixed(0)}% Conf
                      </span>
                    )}
                  </div>

                  <div
                    className={`p-3 rounded-xl max-w-[92%] leading-relaxed ${
                      isUser
                        ? 'bg-[#1E293B] text-gray-100 border border-slate-700/60'
                        : 'bg-[#141414] text-gray-200 border border-[#282828] shadow-md'
                    }`}
                  >
                    <p className="whitespace-pre-line">{msg.text}</p>

                    {/* CAD / Twin Action Badge */}
                    {msg.cadActionSummary && (
                      <div className="mt-2.5 pt-2 border-t border-[#222222] flex items-start gap-1.5 bg-[#0D0D0D] p-2 rounded-lg text-[11px] text-[#2DD4BF] font-mono">
                        <Terminal className="w-3.5 h-3.5 mt-0.5 shrink-0 text-[#2DD4BF]" />
                        <span>{msg.cadActionSummary}</span>
                      </div>
                    )}

                    {/* Interactive Suggested Follow-Up Prompts */}
                    {msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                      <div className="mt-3 pt-2 border-t border-[#222222] space-y-1">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                          Spatially Grounded Actions:
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {msg.suggestedFollowUps.map((action, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleExecuteQuery(action)}
                              className="text-left px-2 py-1 bg-[#1A1A1A] hover:bg-[#252525] border border-[#303030] hover:border-[#2DD4BF]/50 rounded text-[10px] text-gray-300 hover:text-white transition flex items-center gap-1"
                            >
                              <ArrowRight className="w-2.5 h-2.5 text-[#2DD4BF]" />
                              <span>{action}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {isProcessing && (
              <div className="flex items-center gap-2 p-3 bg-[#141414] rounded-xl border border-[#282828] text-xs text-gray-400">
                <div className="w-2 h-2 rounded-full bg-[#2DD4BF] animate-ping" />
                <span className="font-mono text-[11px]">Evaluating Spatial Geometry & Digital Twin...</span>
              </div>
            )}
          </div>

          {/* Quick Spatial Command Toolbar */}
          <div className="px-3 py-1.5 bg-[#0A0A0A] border-t border-[#1C1C1C] flex items-center justify-between text-[10px]">
            <div className="flex items-center gap-1.5 text-gray-400">
              <Compass className="w-3 h-3 text-[#2DD4BF]" />
              <span>Spatially Grounded CAD Prompt</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-gray-500 font-mono">CAD Natural Language</span>
            </div>
          </div>

          {/* Input Prompt Box */}
          <div className="p-2.5 bg-[#111111] border-t border-[#222222] flex items-center gap-2">
            <input
              type="text"
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleExecuteQuery();
              }}
              placeholder='Try "Show demolition within 2km" or "Create 20m x 30m footprint"...'
              className="flex-1 h-8 px-3 bg-[#080808] border border-[#282828] focus:border-[#2DD4BF] rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none transition font-sans"
            />
            <button
              onClick={() => handleExecuteQuery()}
              disabled={!queryInput.trim() || isProcessing}
              className="h-8 px-3 bg-[#2DD4BF] hover:bg-[#26bba8] text-black font-bold text-xs rounded-lg flex items-center justify-center transition disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-[#2DD4BF]/20"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </>
      )}
    </div>
  );
};
