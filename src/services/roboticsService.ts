/**
 * Robotics Service Interface & State Model
 * 
 * Provides mock/demo data and replaceable service interfaces for
 * autonomous construction rovers, LiDAR surveying drones, and 3D printing paths.
 */

import { DataState } from '../types/architecture';

export interface RobotTelemetry {
  id: string;
  name: string;
  type: 'lidar_drone' | 'ground_rover' | 'concrete_3d_printer' | 'excavator_teleop';
  status: 'online' | 'surveying' | 'charging' | 'idle' | 'warning' | 'offline';
  dataState: DataState;
  lastHeartbeat: string;
  batteryPct: number;
  connectionQualityPct: number;
  latencyMs: number;
  currentTask: string;
  position: { x: number; y: number; z: number };
  headingDeg: number;
  payloadData?: {
    pointCloudCount?: number;
    printLayerCurrent?: number;
    printLayerTotal?: number;
    volumeExtrudedM3?: number;
    siteProgressPct?: number;
  };
}

export interface RobotCommand {
  id: string;
  robotId: string;
  commandType: 'start_survey' | 'return_home' | 'pause_print' | 'resume_print' | 'scan_setback' | 'calibrate_origin';
  issuedAt: string;
  status: 'pending' | 'executing' | 'completed' | 'failed';
}

class RoboticsServiceManager {
  private robots: RobotTelemetry[] = [
    {
      id: 'bot_lidar_01',
      name: 'SkyScan-LiDAR Quad-01',
      type: 'lidar_drone',
      status: 'surveying',
      dataState: 'LIVE',
      lastHeartbeat: 'Just now (0.4s ago)',
      batteryPct: 88,
      connectionQualityPct: 99,
      latencyMs: 14,
      currentTask: 'Volumetric Site Contour & Boundary Validation',
      position: { x: 10.5, y: 14.2, z: 8.5 },
      headingDeg: 45,
      payloadData: {
        pointCloudCount: 1420500,
        siteProgressPct: 92,
      },
    },
    {
      id: 'bot_rover_02',
      name: 'TerraBot Ground Rover Mk IV',
      type: 'ground_rover',
      status: 'online',
      dataState: 'LIVE',
      lastHeartbeat: '1.2s ago',
      batteryPct: 76,
      connectionQualityPct: 95,
      latencyMs: 22,
      currentTask: 'Foundation Stakeout & Subgrade Moisture Sensing',
      position: { x: 6.0, y: 8.0, z: 0.1 },
      headingDeg: 180,
      payloadData: {
        siteProgressPct: 84,
      },
    },
    {
      id: 'bot_printer_03',
      name: 'CyBe Gantry 3D Extruder 03',
      type: 'concrete_3d_printer',
      status: 'idle',
      dataState: 'SYNCED',
      lastHeartbeat: '4.8s ago',
      batteryPct: 100,
      connectionQualityPct: 100,
      latencyMs: 8,
      currentTask: 'Awaiting G-Code Layer Slice Validation',
      position: { x: 12.0, y: 15.0, z: 0.0 },
      headingDeg: 0,
      payloadData: {
        printLayerCurrent: 0,
        printLayerTotal: 180,
        volumeExtrudedM3: 0.0,
      },
    },
    {
      id: 'bot_arm_04',
      name: 'RebarBot Robotic Arm 04',
      type: 'excavator_teleop',
      status: 'warning',
      dataState: 'STALE',
      lastHeartbeat: '42s ago (Stale Packet)',
      batteryPct: 41,
      connectionQualityPct: 38,
      latencyMs: 184,
      currentTask: 'Rebar Cage Alignment Sensor Sync Delayed',
      position: { x: 4.5, y: 18.2, z: 1.2 },
      headingDeg: 90,
      payloadData: {
        siteProgressPct: 45,
      },
    },
  ];

  private listeners: ((robots: RobotTelemetry[]) => void)[] = [];

  public getRobots(): RobotTelemetry[] {
    return [...this.robots];
  }

  public subscribe(listener: (robots: RobotTelemetry[]) => void): () => void {
    this.listeners.push(listener);
    listener([...this.robots]);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  public sendCommand(robotId: string, commandType: RobotCommand['commandType']): Promise<{ success: boolean; message: string }> {
    return new Promise((resolve) => {
      const robotIndex = this.robots.findIndex((r) => r.id === robotId);
      if (robotIndex === -1) {
        resolve({ success: false, message: `Robot ${robotId} not found.` });
        return;
      }

      const target = { ...this.robots[robotIndex] };
      if (commandType === 'start_survey') {
        target.status = 'surveying';
        target.dataState = 'LIVE';
        target.lastHeartbeat = 'Just now (0.2s ago)';
        target.currentTask = 'Autonomous LiDAR Boundary Recalibration';
      } else if (commandType === 'return_home') {
        target.status = 'charging';
        target.dataState = 'SYNCED';
        target.lastHeartbeat = '1.0s ago';
        target.currentTask = 'Navigating to Automated Base Station';
      } else if (commandType === 'pause_print') {
        target.status = 'idle';
        target.dataState = 'SYNCED';
        target.currentTask = 'Print Path Suspended by Operator';
      } else if (commandType === 'resume_print') {
        target.status = 'online';
        target.dataState = 'LIVE';
        target.lastHeartbeat = 'Just now (0.1s ago)';
        target.currentTask = 'Continuous Mortar Deposition (Layer 12/180)';
      } else if (commandType === 'calibrate_origin') {
        target.position = { x: 0, y: 0, z: 0 };
        target.dataState = 'VERIFIED';
        target.lastHeartbeat = 'System calibrated just now';
        target.currentTask = 'WCS Local Datum Zero Synchronized';
      }

      this.robots[robotIndex] = target;
      this.notify();
      resolve({ success: true, message: `Executed ${commandType} on ${target.name}` });
    });
  }

  public setDataState(robotId: string, state: DataState, customTask?: string) {
    const robotIndex = this.robots.findIndex((r) => r.id === robotId);
    if (robotIndex !== -1) {
      this.robots[robotIndex] = {
        ...this.robots[robotIndex],
        dataState: state,
        lastHeartbeat: state === 'LIVE' ? 'Streaming live' : state === 'STALE' ? '30s ago (stale)' : state === 'ERROR' ? 'Connection dropped' : 'Synced',
        currentTask: customTask || this.robots[robotIndex].currentTask,
      };
      this.notify();
    }
  }

  private notify() {
    this.listeners.forEach((l) => l([...this.robots]));
  }
}

export const roboticsService = new RoboticsServiceManager();
