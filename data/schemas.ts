export interface TimelineEvent {
  time: string;
  description: string;
  witnesses?: string[]; // Character IDs who saw this
}

export interface EvidenceItem {
  id: string;
  name: string;
  description: string;
  location: string;
  found: boolean;
}

export interface CrimeTruth {
  victim: {
    name: string;
    timeOfDeath: string;
    location: string;
    causeOfDeath: string;
  };
  murdererId: string; // The ID of the character who did it
  motive: string;
  timeline: TimelineEvent[];
  evidence: EvidenceItem[];
  realSequenceOfEvents: string; // Narrative description of what actually happened
}

export interface CharacterKnownFact {
  id: string;
  content: string;
  isSecret: boolean; // If true, they won't volunteer this unless pressured or confronted with evidence
}

export interface Character {
  id: string;
  name: string;
  role: 'suspect' | 'witness' | 'innocent'; // Descriptive role
  isMurderer: boolean;
  
  // Personality traits for AI Persona
  personality: string;
  relationToVictim: string;
  alibi: string; // Their claimed alibi (might be fake if murderer or hiding something else)

  // Knowledge base
  knownFacts: CharacterKnownFact[];
  
  // Dynamic State
  pressure: number; // 0-100
  patience: number; // 0-100, decreases with annoyance
  isBreaking: boolean; // If true, they might slip or confess
}

export interface GameState {
  currentScenarioId: string;
  turnCount: number;
  isGameOver: boolean;
  gameResult?: 'WIN' | 'LOSE';
  
  // Track which facts have been revealed to the player
  discoveredFactIds: string[];
  
  // Character states (pressure, patience, etc) mutable during game
  characters: Record<string, Character>;
  
  // Chat History per character or global? Usually per room/character.
  // For this simplified version, maybe just a global log or per character.
  // We'll let the frontend handle UI state, but backend tracks critical history if needed.
}
