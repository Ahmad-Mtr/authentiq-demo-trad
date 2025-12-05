export interface WorkExperience {
  title?: string;
  company?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
  achievements?: string[];
}

export interface Education {
  degree?: string;
  institution?: string;
  startDate?: string;
  endDate?: string;
  fieldOfStudy?: string;
  gpa?: string;
}

export interface Skill {
  name?: string;
}

export interface Language {
  language?: string;
  level?: string;
}

export interface Certification {
  name?: string;
  issuer?: string;
  date?: string;
  expiryDate?: string;
  credentialId?: string;
}

export interface Project {
  name?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  technologies?: string[];
  url?: string;
}

export interface ParsedResume {
  personalInfo?: {
    name?: string;
    email?: string;
    phone?: string;
    location?: string;
    linkedin?: string;
    github?: string;
    website?: string;
  };
  summary?: string;
  experiences?: WorkExperience[];
  education?: Education[];
  skills?: Skill[];
  certifications?: Certification[];
  projects?: Project[];
  languages?: Language[];
}
