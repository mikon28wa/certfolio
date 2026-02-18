export interface SkillMapping {
  skillName: string;
  skillCategory: string;
  weight: number;
  reasoning?: string;
}

export interface Certificate {
  id: number;
  title: string;
  issuer: string;
  issueDate?: string | Date | null;
  description?: string | null;
  skills?: string | null;
  level?: string | null;
  category?: string | null;
  customCategory?: string | null;
  priority?: string | null;
  isVerified?: boolean | number | null;
  verificationUrl?: string | null;
  fileUrl?: string | null;
  fileName?: string | null;
  mimeType?: string | null;
  externalUrl?: string | null;
  isPublic?: boolean | number | null;
  tags?: string | null;
  courseUuid?: string | null;
  courseDuration?: number | null;
  courseCredits?: number | null;
  completionGrade?: string | null;
  learningHours?: number | null;
}

export interface EditCertificateFormState {
  title: string;
  issuer: string;
  issueDate: string;
  description: string;
  level: string;
  category: string;
  customCategory: string;
  priority: string;
  isVerified: boolean;
  verificationUrl: string;
  externalUrl: string;
  isPublic: boolean;
  courseUuid: string;
  courseDuration: string;
  courseCredits: string;
  completionGrade: string;
  learningHours: string;
}

export interface SkillEditorState {
  skillMappings: SkillMapping[];
  newSkillName: string;
  newSkillCategory: string;
  newSkillWeight: string;
}

export interface EditCertificateFormActions {
  // Field setters
  setField: <K extends keyof EditCertificateFormState>(key: K, value: EditCertificateFormState[K]) => void;
  
  // Skill actions
  addSkill: () => void;
  removeSkill: (index: number) => void;
  updateSkillWeight: (index: number, newWeight: string) => void;
  setNewSkillName: (name: string) => void;
  setNewSkillCategory: (category: string) => void;
  setNewSkillWeight: (weight: string) => void;
  setSkillMappings: (mappings: SkillMapping[]) => void;
  
  // Main actions
  handleReanalyze: () => Promise<void>;
  handleSubmit: () => Promise<void>;
  
  // Computed
  totalWeight: number;
  isAnalyzing: boolean;
  isPending: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}
