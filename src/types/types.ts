export type Grammar = [string, string][];

export type FirstFollow = Record<string, Set<string>>;

export type TerminalandNonTerminal = string[];

export type State = Record<string, Grammar>;

export type Goto = [string, string][];

export type Closure = Record<string, Grammar>;