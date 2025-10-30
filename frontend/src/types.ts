// frontend/src/types.ts

/**
 * Represents a user's profile.
 * The 'contact_email' is only populated for the user viewing their *own* profile
 * or for a user who has an 'accepted' interest.
 */
export interface UserProfile {
  id: string;
  role: 'developer' | 'idea_generator' | 'both';
  name: string | null;
  location: string | null;
  bio: string | null;
  skills: string[];
  github_url: string | null;
  linkedin_url: string | null;
  contact_email: string | null; // This is private by default
  created_at: string;
}

/**
 * Represents a project.
 * The 'creator' may or may not include private contact info.
 */
export interface Project {
  id: number;
  title: string;
  description: string;
  tech_stack: string[];
  location: string;
  skill_level: string;
  time_commitment: string;
  status: string;
  repo_url?: string;
  created_at: string;
  interest_count?: number;
  creator?: UserProfile;
}

/**
 * Represents an expression of interest.
 * Can be populated with project or developer details.
 */
export interface Interest {
  id: number;
  project_id?: number; // Not always present
  developer_id: string;
  message: string;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
  developer?: UserProfile; // Populated for project owners
  project?: Project;     // Populated for developers (My Interests)
}