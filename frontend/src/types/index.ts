// types/index.ts

export interface Patient {
  id: number;
  full_name: string;
  date_of_birth: string;
  sex: 'male' | 'female';
}

export interface Diagnostic {
  id: number;
  patientId: number;
  patientName: string;
  sex: 'male' | 'female';
  age: number;
  symptomes: string[];
  diagnostic: string;
  date: string;
  severityScore: number;
  disease?: string;       // 🔹 ajouter optionnel
  probability?: number;   // 🔹 ajouter optionnel
  justification?: string; // <-- ajouter cette ligne
}


export interface Symptome {
  fr: string;
  en: string;
  severity: number;
}
export interface DiagnosticStats {
  disease: string;
  count: number;
  averageSeverity?: number;
  sex: 'male' | 'female';
  age: number; // 🔹 ajouter pour filtrage par âge
}

export interface WebResult {
  title: string;
  url: string;
  snippet: string;
}
export type SubView = 'name' | 'symptome' | 'date' | 'diagnostic' | 'add' | 'history' | 'scanner' | 'search' | 'graph' | 'stats' ;
