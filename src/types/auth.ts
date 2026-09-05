export interface ArchitectProfile {
  id: string;
  fullName: string;
  email: string;
  studioName: string;
  country: string;
  primaryDiscipline: string;
  roles: string[];
  disciplines: string[];
  experienceLevel: 'emerging' | 'professional' | 'senior' | 'practice';
  designPriorities: string[];
  tools: string[];
  sustainabilityLevel: 'exploring' | 'practicing' | 'advanced' | 'expert';
  climateRegion: string;
  firstProjectType: string;
  aiPreferences: {
    creativity: number; // 0 (Precise) to 100 (Experimental)
    guidance: number; // 0 (Minimal) to 100 (Proactive)
    sustainability: number; // 0 (Optional) to 100 (Always Consider)
    costAwareness: number; // 0 (Low) to 100 (High)
  };
  registrationNumber?: string;
  isLoggedIn: boolean;
  createdAt: string;
}

export const DEFAULT_ARCHITECT_PROFILE: ArchitectProfile = {
  id: 'usr_architect_default',
  fullName: 'Simao Lusimadio',
  email: 'simao.lusimadio@gmail.com',
  studioName: 'LORA ARCHITECTURAL & BIM STUDIO',
  country: 'United Kingdom',
  primaryDiscipline: 'Architect',
  roles: ['Architect', 'Architectural Technologist'],
  disciplines: ['Residential', 'Sustainable Architecture', 'Commercial'],
  experienceLevel: 'senior',
  designPriorities: ['Sustainability', 'Energy efficiency', 'Passive design', 'AI-assisted design'],
  tools: ['Revit', 'Rhino', 'Grasshopper', 'AutoCAD'],
  sustainabilityLevel: 'advanced',
  climateRegion: 'Temperate Oceanic (Cfb)',
  firstProjectType: 'Residential',
  aiPreferences: {
    creativity: 45,
    guidance: 65,
    sustainability: 90,
    costAwareness: 60,
  },
  registrationNumber: 'SACAP / AIA REG. 2026-4829',
  isLoggedIn: false,
  createdAt: new Date().toISOString(),
};

export const AUTH_STORAGE_KEY = 'lora_architect_profile_v1';

export function loadSavedProfile(): ArchitectProfile {
  try {
    const saved = localStorage.getItem(AUTH_STORAGE_KEY);
    if (saved) {
      return { ...DEFAULT_ARCHITECT_PROFILE, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.error('Failed to parse saved profile:', e);
  }
  return DEFAULT_ARCHITECT_PROFILE;
}

export function saveProfile(profile: ArchitectProfile): void {
  try {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save profile:', e);
  }
}
