export type Grammar = [string, string][];

export type FirstFollow = Record<string, Set<string>>;

export type TerminalandNonTerminal = string[];

export type State = Record<number, Grammar>;

export type Goto = [string, string][];

export type Closure = Record<string, Grammar>;

export type StateTransition = {
  from: number;
  scanned: string;
  to: number;
};

export interface DFANode {
  id: string;
  label: string;
  x: number;
  y: number;
  productions: string[];
}

export interface DFAEdge {
  from: string;
  to: string;
  label: string;
}

export interface DFAData {
  nodes: DFANode[];
  edges: DFAEdge[];
}

