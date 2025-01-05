export type Grammar = [string, string][];

export type FirstFollow = Record<string, Set<string>>;

export type TerminalandNonTerminal = string[];

export type State = Grammar[];

export type Goto = Record<string, State>[];

export type Closure = Record<string, Grammar>;