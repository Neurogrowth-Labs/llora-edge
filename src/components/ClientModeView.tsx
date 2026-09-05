import React, { useState } from 'react';
import {
  Sparkles,
  Layers,
  Leaf,
  DollarSign,
  Send,
  CheckCircle2,
  Clock,
  ArrowRight,
  MessageSquare,
  Maximize2,
  X,
  Compass,
  Building,
} from 'lucide-react';
import { ArchitecturalProject, ClientProposalRequest } from '../types/architecture';
import { Viewer3D } from './Viewer3D';
import { executeAiAction } from '../services/aiActionsExecutor';

interface ClientModeViewProps {
  project: ArchitecturalProject;
  setProject: React.Dispatch<React.SetStateAction<ArchitecturalProject>>;
  onExitClientMode: () => void;
}

export const ClientModeView: React.FC<ClientModeViewProps> = ({
  project,
  setProject,
  onExitClientMode,
}) => {
  const [activeSubView, setActiveSubView] = useState<'3d' | 'narrative' | 'proposals'>('3d');
  const [clientRequestText, setClientRequestText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successNote, setSuccessNote] = useState<string | null>(null);

  const totalArea = project.rooms.reduce((acc, r) => acc + r.floorArea, 0);
  const bedroomsCount = project.rooms.filter((r) => r.type.includes('bedroom')).length;
  const bathroomsCount = project.rooms.filter((r) => r.type.includes('bathroom')).length;

  const handleSendClientProposal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientRequestText.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setTimeout(() => {
      const newProposal: ClientProposalRequest = {
        id: `prop_${Date.now()}`,
        clientName: project.clientName || 'Client / Investor',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        userPrompt: clientRequestText,
        aiInterpretation: `Proposed architectural revision: "${clientRequestText}". Prepared parametric adaptation for architect approval.`,
        status: 'pending_review',
        estimatedCostImpactUSD: clientRequestText.toLowerCase().includes('larger') ? 4500 : 0,
        estimatedDaylightImpact: '+5% daylight exposure',
        suggestedActionType: 'client_revision',
      };

      setProject((prev) => ({
        ...prev,
        clientProposals: [newProposal, ...(prev.clientProposals || [])],
      }));

      setClientRequestText('');
      setIsSubmitting(false);
      setSuccessNote('Your revision request has been submitted to the lead architect for review.');
      setTimeout(() => setSuccessNote(null), 4000);
    }, 400);
  };

  const handleApproveProposal = (proposal: ClientProposalRequest) => {
    const { updatedProject } = executeAiAction(project, proposal.userPrompt);
    setProject({
      ...updatedProject,
      clientProposals: (updatedProject.clientProposals || []).map((p) =>
        p.id === proposal.id ? { ...p, status: 'approved_and_applied' } : p
      ),
    });
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#070707] text-[#E0E0E0] font-sans overflow-hidden">
      {/* Top Client Header */}
      <header className="h-16 border-b border-[#222] flex items-center justify-between px-6 bg-[#0E0E0E] shrink-0 z-40">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#2DD4BF] rounded flex items-center justify-center text-black font-black text-sm">
              C
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white tracking-tight">{project.name}</span>
                <span className="px-2 py-0.5 bg-[#2DD4BF]/20 text-[#2DD4BF] text-[10px] font-bold uppercase rounded border border-[#2DD4BF]/30">
                  Client Presentation Mode
                </span>
              </div>
              <span className="text-[11px] text-gray-400">{project.climate.location} | {project.style}</span>
            </div>
          </div>
        </div>

        {/* View Switcher */}
        <div className="flex bg-[#1A1A1A] rounded-lg p-1 border border-[#2E2E2E] text-xs">
          <button
            onClick={() => setActiveSubView('3d')}
            className={`px-4 py-1.5 font-bold rounded transition ${
              activeSubView === '3d' ? 'bg-[#333] text-[#2DD4BF]' : 'text-gray-400 hover:text-white'
            }`}
          >
            3D Exploration
          </button>
          <button
            onClick={() => setActiveSubView('narrative')}
            className={`px-4 py-1.5 font-bold rounded transition ${
              activeSubView === 'narrative' ? 'bg-[#333] text-[#2DD4BF]' : 'text-gray-400 hover:text-white'
            }`}
          >
            Project Narrative
          </button>
          <button
            onClick={() => setActiveSubView('proposals')}
            className={`px-4 py-1.5 font-bold rounded transition flex items-center gap-1.5 ${
              activeSubView === 'proposals' ? 'bg-[#333] text-[#2DD4BF]' : 'text-gray-400 hover:text-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Proposed Revisions ({project.clientProposals?.length || 0})</span>
          </button>
        </div>

        {/* Exit Button */}
        <button
          onClick={onExitClientMode}
          className="px-3.5 py-1.5 bg-[#1C1C1C] hover:bg-[#2A2A2A] border border-[#333] rounded text-xs font-semibold text-gray-300 hover:text-white transition flex items-center gap-1.5"
        >
          <span>Exit to Architect Mode</span>
        </button>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* SUB-VIEW 1: 3D INTERACTIVE VIEWER WITH CLIENT METRICS */}
        {activeSubView === '3d' && (
          <div className="flex-1 flex relative">
            <Viewer3D project={project} />

            {/* Floating Client KPI Card */}
            <div className="absolute top-6 left-6 z-30 bg-[#0C0C0C]/90 backdrop-blur-md border border-[#262626] rounded-xl p-4 shadow-2xl space-y-3 w-80">
              <div className="flex items-center justify-between border-b border-[#222] pb-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider">Building Summary</span>
                <span className="text-xs font-mono text-[#2DD4BF]">{totalArea.toFixed(0)} m² GFA</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 bg-[#171717] rounded border border-[#262626]">
                  <span className="text-gray-400 text-[10px] uppercase">Bedrooms</span>
                  <div className="text-base font-bold text-white">{bedroomsCount} Suites</div>
                </div>
                <div className="p-2 bg-[#171717] rounded border border-[#262626]">
                  <span className="text-gray-400 text-[10px] uppercase">Bathrooms</span>
                  <div className="text-base font-bold text-white">{bathroomsCount} Baths</div>
                </div>
              </div>

              <div className="p-2.5 bg-[#0F1E1B] border border-[#2DD4BF]/30 rounded text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#2DD4BF] flex items-center gap-1">
                    <Leaf className="w-3.5 h-3.5" /> EDGE Sustainable
                  </span>
                  <span className="font-bold text-white">-{project.sustainability.energySavingsPct}% Energy</span>
                </div>
                <p className="text-[11px] text-gray-400">
                  {project.sustainability.solarPvCapacityKwp} kWp Solar Array + {project.sustainability.rainwaterHarvestingCapacityLiters.toLocaleString()}L Rainwater Tank
                </p>
              </div>

              <div className="pt-1 flex items-center justify-between text-xs text-gray-400">
                <span>Estimated Investment:</span>
                <strong className="text-white text-sm font-bold">
                  ${project.cost.totalEstimatedCostUSD.toLocaleString()} USD
                </strong>
              </div>
            </div>

            {/* Bottom Floating Request Bar */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 w-full max-w-xl px-4">
              <form
                onSubmit={handleSendClientProposal}
                className="bg-[#0C0C0C]/95 backdrop-blur-md border border-[#333] rounded-full p-1.5 pl-5 shadow-2xl flex items-center gap-3"
              >
                <Sparkles className="w-4 h-4 text-[#2DD4BF] shrink-0" />
                <input
                  type="text"
                  value={clientRequestText}
                  onChange={(e) => setClientRequestText(e.target.value)}
                  placeholder="Request a design revision (e.g., 'Make the living room larger' or 'Add pool pergola')..."
                  className="w-full bg-transparent text-xs text-white placeholder-gray-500 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={isSubmitting || !clientRequestText.trim()}
                  className="px-4 py-2 bg-[#2DD4BF] hover:bg-[#22bca6] disabled:opacity-50 text-black font-bold text-xs rounded-full transition shrink-0"
                >
                  Send Proposal
                </button>
              </form>
            </div>
          </div>
        )}

        {/* SUB-VIEW 2: PROJECT NARRATIVE */}
        {activeSubView === 'narrative' && (
          <div className="flex-1 overflow-y-auto p-8 max-w-4xl mx-auto space-y-6">
            <div className="space-y-2">
              <h1 className="text-2xl font-black text-white">{project.name}</h1>
              <p className="text-sm text-gray-400">
                Architectural Design Statement & Client Vision Book
              </p>
            </div>

            <div className="p-6 bg-[#0E0E0E] border border-[#222] rounded-xl space-y-4 text-xs text-gray-300 leading-relaxed">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Concept & Bioclimatic Strategy</h2>
              <p>
                Situated in <strong>{project.climate.location}</strong>, this design unites <strong>{project.style}</strong> architecture with high-performance resource conservation. The building orientation prioritizes optimal natural daylight autonomy while shielding interior living spaces from intense western afternoon glare through deep overhangs and operable timber louvers.
              </p>
              <p>
                The space planning features an expansive open-plan living and dining pavilion that effortlessly flows into shaded outdoor courtyards and private garden terraces.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-[#0E0E0E] border border-[#222] rounded-xl space-y-2 text-xs">
                <span className="text-[11px] text-gray-400 font-semibold uppercase">Gross Living Area</span>
                <div className="text-xl font-bold text-white">{totalArea.toFixed(1)} m²</div>
                <p className="text-gray-400">{project.rooms.length} programmed spatial zones.</p>
              </div>

              <div className="p-4 bg-[#0E0E0E] border border-[#222] rounded-xl space-y-2 text-xs">
                <span className="text-[11px] text-gray-400 font-semibold uppercase">Sustainability Rating</span>
                <div className="text-xl font-bold text-[#2DD4BF]">EDGE Certified</div>
                <p className="text-gray-400">Exceeds 20% operational resource savings baseline.</p>
              </div>

              <div className="p-4 bg-[#0E0E0E] border border-[#222] rounded-xl space-y-2 text-xs">
                <span className="text-[11px] text-gray-400 font-semibold uppercase">Cost Budget</span>
                <div className="text-xl font-bold text-white">${project.cost.totalEstimatedCostUSD.toLocaleString()}</div>
                <p className="text-gray-400">Preliminary schematic estimate ($USD).</p>
              </div>
            </div>
          </div>
        )}

        {/* SUB-VIEW 3: PROPOSALS & CLIENT REVISIONS */}
        {activeSubView === 'proposals' && (
          <div className="flex-1 overflow-y-auto p-8 max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-white">Client Revision Proposals</h1>
                <p className="text-xs text-gray-400">
                  Track natural-language change requests and their architect-verified impact evaluations.
                </p>
              </div>
            </div>

            {successNote && (
              <div className="p-3 bg-green-950/40 border border-green-500/40 rounded-lg text-green-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
                <span>{successNote}</span>
              </div>
            )}

            <div className="space-y-3">
              {(project.clientProposals || []).length === 0 ? (
                <div className="p-8 text-center bg-[#0E0E0E] border border-[#222] rounded-xl text-gray-500 text-xs">
                  No revision proposals submitted yet. Use the prompt input to suggest design adjustments.
                </div>
              ) : (
                project.clientProposals.map((prop) => (
                  <div
                    key={prop.id}
                    className="p-4 bg-[#0E0E0E] border border-[#222] rounded-xl space-y-2.5 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-sm">"{prop.userPrompt}"</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          prop.status === 'approved_and_applied'
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {prop.status === 'approved_and_applied' ? 'Approved & Applied' : 'Pending Review'}
                      </span>
                    </div>

                    <p className="text-gray-400">{prop.aiInterpretation}</p>

                    <div className="flex items-center justify-between pt-2 border-t border-[#1C1C1C] text-[11px] text-gray-500">
                      <span>Submitted at {prop.timestamp} by {prop.clientName}</span>
                      {prop.status === 'pending_review' && (
                        <button
                          onClick={() => handleApproveProposal(prop)}
                          className="px-3 py-1 bg-[#2DD4BF] hover:bg-[#22bca6] text-black font-bold rounded transition"
                        >
                          Approve & Apply to Model
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
