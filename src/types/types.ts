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