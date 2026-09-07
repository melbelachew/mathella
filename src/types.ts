export type Mode = 'solve' | 'detect' | 'recall';
export interface Problem { title: string; text: string; answer: number; unit: string; shape: 'rectangle' | 'square' | 'triangle' | 'parallelogram' | 'text'; a?: number | '?'; b?: number | '?'; visual?: string; steps: string[] }
export interface Detective { text: string; options: string[]; correct: number; why: string }
export interface Card { prompt: string; formula: string; why: string; example: string }
export interface Topic { id: string; name: string; subtitle: string; problems: Problem[]; detectives: Detective[]; cards: Card[] }
export interface Progress { sparks: number; done: Record<string, boolean> }
