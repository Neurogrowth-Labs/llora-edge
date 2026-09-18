import React, { useState, useEffect } from 'react';
import { Bot, Radio, Battery, Activity, Play, Pause, RotateCcw, Crosshair, Wifi, ShieldAlert, CheckCircle2, ChevronRight, X, Clock, AlertTriangle, RefreshCw } from 'lucide-react';
import { roboticsService, RobotTelemetry } from '../services/roboticsService';
import { DataStateBadge } from './DataStateBadge';
import { DataState } from '../types/architecture';
import { useToast } from './ui/Toast';

interface RoboticsControlModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RoboticsControlModal: React.FC<RoboticsControlModalProps> = ({ isOpen, onClose }) => {
  const { showFeatureToast } = useToast();
  const [robots, setRobots] = useState<RobotTelemetry[]>([]);
  const [selectedRobotId, setSelectedRobotId] = useState<string>('bot_lidar_01');
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = roboticsService.subscribe((updated) => {
      setRobots(updated);
    });
    return () => unsubscribe();
  }, []);

  if (!isOpen) return null;

  const selectedRobot = robots.find((r) => r.id === selectedRobotId) || robots[0];

  const handleCommand = async (type: 'start_survey' | 'return_home' | 'pause_print' | 'resume_print' | 'calibrate_origin') => {
    if (!selectedRobot) return;
    showFeatureToast('Robotics Control');
    const res = await roboticsService.sendCommand(selectedRobot.id, type);
    setActionFeedback(res.message);
    setTimeout(() => setActionFeedback(null), 3500);
  };

  const handleSetDataState = (state: DataState) => {
    if (!selectedRobot) return;
    showFeatureToast('Data State Override');
    roboticsService.setDataState(selectedRobot.id, state);
    setActionFeedback(`Data State manually set to ${state}`);
    setTimeout(() => setActionFeedback(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="bg-[#0D0D0D] border border-[#262626] rounded-xl max-w-4xl w-full shadow-2xl overflow-hidden flex flex-col font-sans max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-5 py-4 bg-[#141414] border-b border-[#262626] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span>Autonomous Construction Robotics Dispatch</span>
                <DataStateBadge state="LIVE" label="TELEMETRY LIVE" size="xs" />
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                ROS 2 / MQTT Teleoperation, Drone LiDAR Volumetrics & 3D Print Pathing
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#222222] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Fleet Selector */}
          <div className="w-72 bg-[#0A0A0A] border-r border-[#222222] p-3 space-y-2 overflow-y-auto">
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Active Site Fleet ({robots.length})
              </span>
              <span className="text-[9px] font-mono text-gray-500">POLL: 500ms</span>
            </div>
            {robots.map((bot) => {
              const isSelected = bot.id === selectedRobotId;
              return (
                <button
                  key={bot.id}
                  onClick={() => setSelectedRobotId(bot.id)}
                  className={`w-full p-2.5 rounded-lg border text-left transition flex flex-col gap-1.5 ${
                    isSelected
                      ? 'bg-[#142328] border-cyan-500/50 text-cyan-200'
                      : 'bg-[#111111] border-[#222222] text-gray-300 hover:border-[#333333]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-bold text-xs truncate">{bot.name}</span>
                    <DataStateBadge state={bot.dataState} size="xs" />
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-gray-400">
                    <span className="capitalize">{bot.status}</span>
                    <span className="flex items-center gap-1 text-emerald-400">
                      <Battery className="w-3 h-3" /> {bot.batteryPct}%
                    </span>
                  </div>
                  <div className="text-[9px] font-mono text-gray-500 truncate">
                    Pulse: {bot.lastHeartbeat}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Detail & Telemetry Controls */}
          {selectedRobot && (
            <div className="flex-1 p-5 overflow-y-auto space-y-4">
              {/* Unit Header with Data State Indicator */}
              <div className="flex items-center justify-between p-3 bg-[#111111] border border-[#222222] rounded-lg">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white">{selectedRobot.name}</h3>
                    <DataStateBadge state={selectedRobot.dataState} size="sm" />
                  </div>
                  <p className="text-xs text-gray-400 font-mono mt-0.5">
                    ID: {selectedRobot.id} • Heartbeat: {selectedRobot.lastHeartbeat}
                  </p>
                </div>

                {/* State Freshness Override / Simulation */}
                <div className="flex items-center gap-1">
                  {(['LIVE', 'SYNCED', 'ESTIMATED', 'VERIFIED', 'STALE', 'ERROR'] as DataState[]).map((st) => (
                    <button
                      key={st}
                      onClick={() => handleSetDataState(st)}
                      className={`px-1.5 py-0.5 text-[9px] font-mono font-bold rounded border transition ${
                        selectedRobot.dataState === st
                          ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                          : 'bg-[#181818] border-[#2A2A2A] text-gray-400 hover:text-white'
                      }`}
                      title={`Simulate / Force state to ${st}`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Telemetry Summary Cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-[#121212] border border-[#222222] rounded-lg">
                  <span className="text-[10px] uppercase font-bold text-gray-400 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-cyan-400" /> Robot State
                  </span>
                  <div className="text-sm font-bold text-white capitalize mt-1 flex items-center justify-between">
                    <span>{selectedRobot.status}</span>
                    <span className="text-[10px] font-mono text-gray-400">({selectedRobot.latencyMs}ms ping)</span>
                  </div>
                </div>

                <div className="p-3 bg-[#121212] border border-[#222222] rounded-lg">
                  <span className="text-[10px] uppercase font-bold text-gray-400 flex items-center gap-1.5">
                    <Battery className="w-3.5 h-3.5 text-emerald-400" /> Battery & Link
                  </span>
                  <div className="text-sm font-bold text-emerald-400 mt-1 font-mono">
                    {selectedRobot.batteryPct}% <span className="text-gray-400 text-xs font-normal">| Link: {selectedRobot.connectionQualityPct}%</span>
                  </div>
                </div>

                <div className="p-3 bg-[#121212] border border-[#222222] rounded-lg">
                  <span className="text-[10px] uppercase font-bold text-gray-400 flex items-center gap-1.5">
                    <Crosshair className="w-3.5 h-3.5 text-amber-400" /> Site Coordinates
                  </span>
                  <div className="text-xs font-mono font-bold text-white mt-1">
                    X:{selectedRobot.position.x} Y:{selectedRobot.position.y} Z:{selectedRobot.position.z}m
                  </div>
                </div>
              </div>

              {/* Active Mission / Task */}
              <div className="p-3.5 bg-[#121212] border border-[#222222] rounded-lg space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-gray-400">Active Task Mission:</span>
                  <span className="text-[10px] font-mono text-cyan-400">ROS 2 Topic: /rover/pose</span>
                </div>
                <p className="text-xs text-cyan-300 font-semibold">{selectedRobot.currentTask}</p>
                {selectedRobot.payloadData?.pointCloudCount && (
                  <div className="text-[11px] text-gray-400 font-mono pt-1">
                    LiDAR Points Collected: <strong className="text-white">{selectedRobot.payloadData.pointCloudCount.toLocaleString()} pts</strong> (Site Coverage: {selectedRobot.payloadData.siteProgressPct}%)
                  </div>
                )}
              </div>

              {/* Action Feedback Banner */}
              {actionFeedback && (
                <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs rounded-lg flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>{actionFeedback}</span>
                </div>
              )}

              {/* Command Dispatch Controls */}
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-bold text-gray-400">Direct Operator Controls</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleCommand('start_survey')}
                    className="p-2.5 bg-[#181818] hover:bg-[#222222] border border-[#2A2A2A] rounded-lg text-xs font-bold text-white flex items-center justify-center gap-2 transition"
                  >
                    <Play className="w-3.5 h-3.5 text-cyan-400" /> Start LiDAR Survey
                  </button>

                  <button
                    onClick={() => handleCommand('calibrate_origin')}
                    className="p-2.5 bg-[#181818] hover:bg-[#222222] border border-[#2A2A2A] rounded-lg text-xs font-bold text-white flex items-center justify-center gap-2 transition"
                  >
                    <Crosshair className="w-3.5 h-3.5 text-[#2DD4BF]" /> Calibrate Datum (0,0)
                  </button>

                  <button
                    onClick={() => handleCommand('pause_print')}
                    className="p-2.5 bg-[#181818] hover:bg-[#222222] border border-[#2A2A2A] rounded-lg text-xs font-bold text-amber-300 flex items-center justify-center gap-2 transition"
                  >
                    <Pause className="w-3.5 h-3.5" /> Pause Execution
                  </button>

                  <button
                    onClick={() => handleCommand('return_home')}
                    className="p-2.5 bg-[#181818] hover:bg-[#222222] border border-[#2A2A2A] rounded-lg text-xs font-bold text-gray-300 flex items-center justify-center gap-2 transition"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-rose-400" /> Return to Base
                  </button>
                </div>
              </div>

              {/* Data State Design Legend Reference */}
              <div className="p-3 bg-[#0C0C0C] border border-[#1F1F1F] rounded-lg space-y-2">
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Data State Legend & Freshness Protocol</span>
                  <span className="text-gray-500 font-normal">ISO 19650 CDE & ISO 23386</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="flex items-center gap-1.5 p-1.5 bg-[#121212] rounded border border-[#1C1C1C]">
                    <DataStateBadge state="LIVE" size="xs" />
                    <span className="text-[9px] text-gray-400">Currently receiving live stream</span>
                  </div>
                  <div className="flex items-center gap-1.5 p-1.5 bg-[#121212] rounded border border-[#1C1C1C]">
                    <DataStateBadge state="SYNCED" size="xs" />
                    <span className="text-[9px] text-gray-400">Synchronized successfully</span>
                  </div>
                  <div className="flex items-center gap-1.5 p-1.5 bg-[#121212] rounded border border-[#1C1C1C]">
                    <DataStateBadge state="ESTIMATED" size="xs" />
                    <span className="text-[9px] text-gray-400">Calculated or Design estimate</span>
                  </div>
                  <div className="flex items-center gap-1.5 p-1.5 bg-[#121212] rounded border border-[#1C1C1C]">
                    <DataStateBadge state="VERIFIED" size="xs" />
                    <span className="text-[9px] text-gray-400">Human / system verified</span>
                  </div>
                  <div className="flex items-center gap-1.5 p-1.5 bg-[#121212] rounded border border-[#1C1C1C]">
                    <DataStateBadge state="STALE" size="xs" />
                    <span className="text-[9px] text-gray-400">Not updated recently</span>
                  </div>
                  <div className="flex items-center gap-1.5 p-1.5 bg-[#121212] rounded border border-[#1C1C1C]">
                    <DataStateBadge state="ERROR" size="xs" />
                    <span className="text-[9px] text-gray-400">Data source unavailable</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

