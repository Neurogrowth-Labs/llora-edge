import React, { useState } from 'react';
import {
  Activity,
  Database,
  Radio,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Clock,
  AlertCircle,
  X,
  RefreshCw,
  Server,
  Cloud,
  Cpu,
  Layers,
  Sun,
  Shield,
  Gauge,
  Wifi,
} from 'lucide-react';
import { DataState } from '../types/architecture';
import { DataStateBadge } from './DataStateBadge';

export interface DataPipelineItem {
  id: string;
  name: string;
  category: 'geometry' | 'simulation' | 'compliance' | 'telemetry' | 'carbon' | 'cost';
  dataState: DataState;
  source: string;
  lastUpdated: string;
  confidence: number;
  description: string;
  verificationMethod: string;
}

interface DataStateInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DataStateInspectorModal: React.FC<DataStateInspectorModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [pipelineItems, setPipelineItems] = useState<DataPipelineItem[]>([
    {
      id: 'pipe_geom',
      name: 'Planar 2D & 3D BIM Geometry',
      category: 'geometry',
      dataState: 'SYNCED',
      source: 'Local IndexedDB / Cloud CDE Buffer',
      lastUpdated: '1.2s ago',
      confidence: 100,
      description: 'Parametric wall coordinate vectors, vertices, and level offsets.',
      verificationMethod: 'Dual-pass topology checksum and geometric validation engine.',
    },
    {
      id: 'pipe_cursor',
      name: 'Interactive Canvas Cursor & OSNAP Vector',
      category: 'telemetry',
      dataState: 'LIVE',
      lastUpdated: 'Just now (16ms stream)',
      confidence: 100,
      source: 'PointerEvent & Hardware Viewport Subsystem',
      description: 'Live world coordinate sampling (WCS / UCS / UTM) with real-time snap detection.',
      verificationMethod: 'Continuous browser input polling at 60 FPS.',
    },
    {
      id: 'pipe_daylight',
      name: 'Daylight Autonomy & Lux Heatmap (SANS 10400-O)',
      category: 'simulation',
      dataState: 'ESTIMATED',
      lastUpdated: '3.4s ago',
      confidence: 94,
      source: 'Physics Ray-Casting & CIE Overcast Sky Model',
      description: 'Calculated interior lux distribution, solar azimuth, and window-to-floor daylight ratio.',
      verificationMethod: 'Radiance algorithmic raymarching against SANS 10400-O thresholds.',
    },
    {
      id: 'pipe_sans',
      name: 'SANS 10400 / Statutory Building Code Matrix',
      category: 'compliance',
      dataState: 'VERIFIED',
      lastUpdated: '12s ago',
      confidence: 99,
      source: 'SANS Regulatory Engine v4.2',
      description: 'Minimum habitable room areas, corridor clearance, fire egress, and fenestration ratios.',
      verificationMethod: 'System-verified against South African National Standards statutory rules.',
    },
    {
      id: 'pipe_carbon',
      name: 'Embodied Carbon & EPD Material Lifecycle (LCA)',
      category: 'carbon',
      dataState: 'ESTIMATED',
      lastUpdated: '45s ago',
      confidence: 91,
      source: 'ICE 3.0 & EPD Carbon Database (African Regional Baselines)',
      description: 'A1-A3 cradle-to-gate embodied carbon footprint calculation for rammed earth, concrete, and timber.',
      verificationMethod: 'Calculated parametric volumetric mass x Regional EPD coefficients.',
    },
    {
      id: 'pipe_robot',
      name: 'Autonomous Construction Robotics & Drone LiDAR',
      category: 'telemetry',
      dataState: 'LIVE',
      lastUpdated: '0.4s ago (Live ROS 2 MQTT)',
      confidence: 98,
      source: 'ROS 2 Micro-XRCE Agent & DJI M300 LiDAR RTK',
      description: 'Real-time site point cloud stream, rover telemetry, and 3D concrete gantry position.',
      verificationMethod: 'Live RTK GPS differential fix and IMU Kalman filtering.',
    },
    {
      id: 'pipe_weather',
      name: 'EPW Microclimate & Prevailing Wind Station',
      category: 'simulation',
      dataState: 'LIVE',
      lastUpdated: '2.1s ago',
      confidence: 96,
      source: 'MeteoStat Real-time Weather Station Gateway',
      description: 'Ambient dry-bulb temperature (22.4°C), relative humidity (58%), and wind speed (4.2 m/s).',
      verificationMethod: 'Live telemetry stream cross-referenced with TMY3 historical climate normal.',
    },
    {
      id: 'pipe_rebar',
      name: 'Rebar Placement Verification Feeder',
      category: 'telemetry',
      dataState: 'STALE',
      lastUpdated: '2m 14s ago (Sync Delayed)',
      confidence: 72,
      source: 'Edge Computer Node B4',
      description: 'Photogrammetric optical scan of foundation reinforcement cage before concrete pour.',
      verificationMethod: 'Cached packet buffer - awaiting mesh network reconnect.',
    },
    {
      id: 'pipe_geotech',
      name: 'Geotechnical Borehole Soil Bearing Sensor Gateway',
      category: 'telemetry',
      dataState: 'ERROR',
      lastUpdated: 'Disconnected (14m ago)',
      confidence: 0,
      source: 'Borehole Sensor Hub 02 (Modbus RTU)',
      description: 'In-situ pore pressure and shear wave velocity probe.',
      verificationMethod: 'Sensor hub offline - fallback to regional SANS default soil bearing capacity (150 kPa).',
    },
  ]);

  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterState, setFilterState] = useState<string>('all');

  if (!isOpen) return null;

  const handleToggleState = (id: string, newState: DataState) => {
    setPipelineItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              dataState: newState,
              lastUpdated:
                newState === 'LIVE'
                  ? 'Just now (Live stream)'
                  : newState === 'SYNCED'
                  ? 'Synced just now'
                  : newState === 'STALE'
                  ? '3m ago (Stale)'
                  : newState === 'ERROR'
                  ? 'Unavailable (Error)'
                  : 'Updated',
            }
          : item
      )
    );
  };

  const filteredItems = pipelineItems.filter((item) => {
    if (filterCategory !== 'all' && item.category !== filterCategory) return false;
    if (filterState !== 'all' && item.dataState !== filterState) return false;
    return true;
  });

  const stateCounts = pipelineItems.reduce((acc, item) => {
    acc[item.dataState] = (acc[item.dataState] || 0) + 1;
    return acc;
  }, {} as Record<DataState, number>);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="bg-[#0D0D0D] border border-[#262626] rounded-xl max-w-4xl w-full shadow-2xl overflow-hidden flex flex-col font-sans max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-5 py-4 bg-[#141414] border-b border-[#262626] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  BIM Data State & Telemetry Freshness Pipeline
                </h2>
                <DataStateBadge state="LIVE" label="PIPELINE ACTIVE" size="xs" />
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                ISO 19650 Common Data Environment (CDE) verification, sensor freshness & calculation provenance
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

        {/* State Overview KPI Banner */}
        <div className="p-4 bg-[#101010] border-b border-[#222222] grid grid-cols-6 gap-2">
          {(['LIVE', 'SYNCED', 'ESTIMATED', 'VERIFIED', 'STALE', 'ERROR'] as DataState[]).map((st) => (
            <button
              key={st}
              onClick={() => setFilterState(filterState === st ? 'all' : st)}
              className={`p-2 rounded-lg border text-left transition flex flex-col justify-between ${
                filterState === st
                  ? 'bg-[#1C1C1C] border-cyan-500/50 shadow-md ring-1 ring-cyan-500/30'
                  : 'bg-[#141414] border-[#242424] hover:border-[#333333]'
              }`}
            >
              <div className="flex items-center justify-between">
                <DataStateBadge state={st} size="xs" showIcon={false} />
                <span className="text-xs font-mono font-bold text-white">
                  {stateCounts[st] || 0}
                </span>
              </div>
              <span className="text-[9px] text-gray-400 mt-1 truncate">
                {st === 'LIVE' && 'Receiving data'}
                {st === 'SYNCED' && 'Synchronized'}
                {st === 'ESTIMATED' && 'AI / Calculated'}
                {st === 'VERIFIED' && 'System verified'}
                {st === 'STALE' && 'Needs update'}
                {st === 'ERROR' && 'Unavailable'}
              </span>
            </button>
          ))}
        </div>

        {/* Filter Controls */}
        <div className="px-5 py-2.5 bg-[#0A0A0A] border-b border-[#222222] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="text-gray-400 font-bold uppercase text-[10px]">Filter Subsystems:</span>
            {['all', 'geometry', 'simulation', 'compliance', 'telemetry', 'carbon'].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold transition ${
                  filterCategory === cat
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-gray-400 hover:text-white bg-[#141414] border border-[#222]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="text-[10px] font-mono text-gray-500">
            Showing {filteredItems.length} of {pipelineItems.length} Data Sources
          </div>
        </div>

        {/* Pipeline Item List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="p-3.5 bg-[#121212] border border-[#222222] rounded-lg hover:border-[#333333] transition space-y-2"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-bold text-white">{item.name}</h3>
                    <DataStateBadge state={item.dataState} size="xs" />
                    <span className="px-1.5 py-0.5 rounded bg-[#1A1A1A] border border-[#2A2A2A] text-[9px] font-mono uppercase text-gray-400">
                      {item.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-300">{item.description}</p>
                </div>

                {/* State Diagnostic Switcher */}
                <div className="flex items-center gap-1">
                  {(['LIVE', 'SYNCED', 'ESTIMATED', 'VERIFIED', 'STALE', 'ERROR'] as DataState[]).map(
                    (st) => (
                      <button
                        key={st}
                        onClick={() => handleToggleState(item.id, st)}
                        className={`px-1.5 py-0.5 text-[8px] font-mono font-bold rounded border transition ${
                          item.dataState === st
                            ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                            : 'bg-[#181818] border-[#2A2A2A] text-gray-500 hover:text-gray-300'
                        }`}
                        title={`Simulate state ${st} on ${item.name}`}
                      >
                        {st}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Data Provenance & Verification Metadata */}
              <div className="grid grid-cols-3 gap-2 pt-1 border-t border-[#1C1C1C] text-[10px] font-mono">
                <div className="text-gray-400">
                  <span className="text-gray-500">Source:</span> <strong className="text-gray-300">{item.source}</strong>
                </div>
                <div className="text-gray-400">
                  <span className="text-gray-500">Freshness:</span> <strong className="text-cyan-300">{item.lastUpdated}</strong>
                </div>
                <div className="text-gray-400 text-right">
                  <span className="text-gray-500">Confidence:</span>{' '}
                  <strong className={item.confidence > 90 ? 'text-emerald-400' : 'text-amber-400'}>
                    {item.confidence}%
                  </strong>
                </div>
              </div>

              <div className="text-[9px] text-gray-500 italic bg-[#0A0A0A] p-1.5 rounded border border-[#181818]">
                <strong>Verification:</strong> {item.verificationMethod}
              </div>
            </div>
          ))}
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-[#141414] border-t border-[#262626] flex items-center justify-between text-xs">
          <div className="flex items-center gap-3 text-gray-400 text-[10px]">
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> All critical sync pipelines active
            </span>
            <span>• ISO 19650 Level 2 Compliant</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#2DD4BF] hover:bg-[#26bba8] text-black font-bold text-xs rounded transition"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
