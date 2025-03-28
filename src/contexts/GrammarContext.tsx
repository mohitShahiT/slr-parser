import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  FirstFollow,
  Grammar,
  TerminalandNonTerminal,
  Closure,
  State,
  StateTransition,
} from "../types/types";
import { scanNextChar } from "../utils/scanNextChar";
interface GrammarProviderProps {
  grammar: Grammar;
  terminals: TerminalandNonTerminal;
  nonTerminals: TerminalandNonTerminal;
  first: Record<string, Set<string>>;
  follow: Record<string, Set<string>>;
  augmentedGrammar: Grammar;
  createGrammar: (rawGrammar: string) => void;
  transitions: StateTransition[];
  closures: Closure;
  states: State[];
  finalState: number | undefined;
  prefix: string;
  conflict: boolean;
  setConflict: (val: boolean) => void;
}

/*
S -> E
E -> E + T | T
T -> T * F | F
F -> id

S->A A   
A->aA|b
*/

const GrammarContext = createContext<GrammarProviderProps | null>(null);

export const GrammarProvider: React.FC<{ children: ReactNode }> = function ({
  children,
}) {
  const [grammar, setGrammar] = useState<Grammar>([]);
  const [terminals, setTerminals] = useState<TerminalandNonTerminal>([]);
  const [nonTerminals, setNonTerminals] = useState<TerminalandNonTerminal>([]);
  const [first, setFirst] = useState<Record<string, Set<string>>>({});
  const [follow, setFollow] = useState<Record<string, Set<string>>>({});
  const [augmentedGrammar, setAugmentedGrammar] = useState<Grammar>([]);
  const [states, setStates] = useState<State[]>([]);
  const [transitions, setTransitions] = useState<StateTransition[]>([]);
  const [closures, setClosures] = useState<Closure>({});
  const [finalState, setFinalState] = useState<number | undefined>(undefined);
  const [conflict, setConflict] = useState<boolean>(false);
  // const [prefix, setPrefix] = useState("•");
  const prefix = "•";

  async function augmentGrammarWithDot(
    originalGrammar: Grammar,
    prefix: string
  ): Promise<Grammar> {
    if (originalGrammar.length === 0) {
      console.error("The grammar is empty and cannot be augmented.");
      return [];
    }

    // Step 1: Get the original start symbol (LHS of the first production)
    const originalStartSymbol = originalGrammar[0][0];
    // Step 2: Define a new start symbol (e.g., `S'`)
    const newStartSymbol = `${originalStartSymbol}'`;

    const augmentedStartRule: [string, string] = [
      newStartSymbol,
      `${prefix}${originalStartSymbol}`,
    ];

    // Step 4: Add the dot at the beginning of every RHS in the original grammar
    const augmentedRules: [string, string][] = originalGrammar.map(
      ([lhs, rhs]) => {
        const augmentedRhs = `${prefix}${rhs}`; // Add the dot to the beginning of the RHS
        return [lhs, augmentedRhs];
      }
    );

    // Step 5: Combine the new start rule with the augmented original grammar
    const augmentedGrammar: Grammar = [augmentedStartRule, ...augmentedRules];
    setAugmentedGrammar(augmentedGrammar);
    return augmentedGrammar;
  }

  async function createGrammar(rawGrammar: string) {
    const terminalElements: Set<string> = new Set();
    const nonTerminalElements: Set<string> = new Set();

    const normalizedGrammar = rawGrammar
      .replace(/\s*->\s*/g, " -> ")
      .replace(/\s*\|\s*/g, " | ")
      .replace(/\s+/g, " ")
      .trim();

    const rules = normalizedGrammar.split(/ (?=[A-Z]+ ->)/);
    console.log("rules", rules, normalizedGrammar);
    const finalGrammar: Grammar = [];

    rules.forEach((rule) => {
      const [lhs, rhs] = rule.split("->").map((part) => part.trim());

      if (!lhs || !rhs) {
        alert("Enter valid Grammar")
        console.warn(`Skipping invalid rule: ${rule}`);
        return;
      }

      nonTerminalElements.add(lhs);

      const rhsOptions = rhs.split("|").map((option) => option.trim());

      rhsOptions.forEach((rhsOption) => {
        finalGrammar.push([lhs, rhsOption]);

        const tokens = tokenizeRHS(rhsOption);
        tokens.forEach((token) => {
          if (/^[A-Z]+$/.test(token)) {
            nonTerminalElements.add(token);
          } else {
            terminalElements.add(token);
          }
        });
      });
    });

    setGrammar(finalGrammar);
    setTerminals([...terminalElements]);
    setNonTerminals([...nonTerminalElements]);
    const newAugmentedGrammar = await augmentGrammarWithDot(
      finalGrammar,
      prefix
    );
    const newFirst = await calculateFirst(
      finalGrammar,
      [...terminalElements],
      [...nonTerminalElements]
    );
    await calculateFollow(finalGrammar, newFirst, [
      ...nonTerminalElements,
    ]);

    const newClosure = await findClosure(newAugmentedGrammar, [
      ...nonTerminalElements,
    ]);

    // Deep comparison function
    function deepEqual(obj1: Grammar, obj2: Grammar): boolean {
      // Perform deep comparison logic here based on the structure of Grammar
      // For example, comparing rules, name, etc.
      return JSON.stringify(obj1) === JSON.stringify(obj2); // Simple deep comparison using JSON serialization
    }

    // console.log("Final Grammar:", finalGrammar);
    // console.log("Terminals:", [...terminalElements]);
    // console.log("Non-terminals:", [...nonTerminalElements]);
    // console.log("FIRST:", newFirst);
    // console.log("FOLLOW:", newFollow);
    // console.log("Closures:", newClosure);
    // console.log("Augmented grammar", newAugmentedGrammar);
    // console.log("before start", newAugmentedGrammar);

    const transitons: StateTransition[] = [];
    const tempStates: State[] = [
      {
        0: newAugmentedGrammar,
      },
    ];
    /*
    //state transition 
    [
      {
        from: 0
        scan: symbol
        to: 2
      }
    ]

    [
      {
        I0: {}
      }
    ]
    */
    let index = 0;
    let nextStateNum = 1;
    let finalStateDum = undefined;
    const startS = finalGrammar[0][0];
    while (index < tempStates.length) {
      const [stateNum, state] = Object.entries(tempStates[index])[0];
      for (const symbol of [...terminalElements, ...nonTerminalElements]) {
        const nextState = await scanNextToken(
          state,
          symbol,
          [...terminalElements],
          [...nonTerminalElements],
          newClosure
        );

        if (nextState.length > 0) {
          // Check if the nextState already exists in netTempStates
          const stateExistsIndex = tempStates.findIndex((existingState) => {
            return Object.values(existingState).some((existingGrammar) => {
              return deepEqual(existingGrammar, nextState);
            });
          });
          if (stateExistsIndex === -1) {
            nextState.forEach(([, rhs]) => {
              if (rhs === `${startS}${prefix}`) finalStateDum = nextStateNum;
            });
            //does not exist
            tempStates.push({
              [nextStateNum]: nextState,
            });
            transitons.push({
              from: Number(stateNum),
              to: nextStateNum,
              scanned: symbol,
            });
            nextStateNum++;
          } else {
            transitons.push({
              from: Number(stateNum),
              to: Number(Object.keys(tempStates[stateExistsIndex])[0]),
              scanned: symbol,
            });
          }
        }
      }
      index++;
    }

    setStates(tempStates);
    setTransitions(transitons);
    setFinalState(finalStateDum);
    // console.log("index", index);
    // console.log("states", tempStates);
    // console.log("transitions", transitons);
  }

  function tokenizeRHS(rhs: string): string[] {
    const tokens: string[] = [];
    let currentToken = "";
    let i = 0;

    while (i < rhs.length) {
      const char = rhs[i];

      if (char === " ") {
        if (currentToken) {
          tokens.push(currentToken);
          currentToken = "";
        }
      } else if (/[A-Z]/.test(char)) {
        if (currentToken && !/[A-Z]/.test(currentToken[0])) { // terminal
          tokens.push(currentToken);
          currentToken = "";
        }
        currentToken += char;
      } else {
        if (currentToken && /[A-Z]/.test(currentToken[0])) { // non-Terminal
          tokens.push(currentToken);
          currentToken = "";
        }
        currentToken += char;
      }
      i++;
    }

    if (currentToken) {
      tokens.push(currentToken);
    }

    return tokens;
  }

  async function calculateFirst(
    grammar: Grammar,
    terminals: string[],
    nonTerminals: string[]
  ) {
    const firstSets: FirstFollow = {};

    // Initialize FIRST sets for all terminals and non-terminals
    terminals.forEach((terminal) => {
      firstSets[terminal] = new Set([terminal]); // FIRST(terminal) = {terminal}
    });
    nonTerminals.forEach((nonTerminal) => {
      firstSets[nonTerminal] = new Set(); // Initialize empty FIRST(non-terminal)
    });

    let changed = true;

    // Iteratively compute FIRST sets until stable
    while (changed) {
      changed = false;

      for (const [lhs, rhs] of grammar) {
        const firstLHS = firstSets[lhs];
        const oldSize = firstLHS.size;

        const rhsTokens = tokenizeRHS(rhs);

        for (let i = 0; i < rhsTokens.length; i++) {
          const token = rhsTokens[i];

          // Add FIRST(token) to FIRST(lhs), excluding ε
          if (firstSets[token]) {
            for (const item of firstSets[token]) {
              if (item !== "ε") {
                firstLHS.add(item);
              }
            }
          }

          // Stop if token does not derive ε
          if (!firstSets[token]?.has("ε")) {
            break;
          }

          // If token derives ε and it's the last token, add ε to FIRST(lhs)
          if (i === rhsTokens.length - 1) {
            firstLHS.add("ε");
          }
        }

        if (firstLHS.size > oldSize) {
          changed = true;
        }
      }
    }

    setFirst(() => firstSets);
    return firstSets;
  }

  async function calculateFollow(
    grammar: Grammar,
    first: FirstFollow,
    nonTerminals: string[]
  ) {
    const followSets: FirstFollow = {};

    nonTerminals.forEach((nt) => {
      followSets[nt] = new Set();
    });
    followSets[grammar[0][0]].add("$");

    let updated = true;
    while (updated) {
      updated = false;

      grammar.forEach(([lhs, rhs]) => {
        const tokens = tokenizeRHS(rhs);
        for (let i = 0; i < tokens.length; i++) {
          const token = tokens[i];
          if (nonTerminals.includes(token)) {
            const followToken = followSets[token];
            const beforeSize = followToken.size;

            for (let j = i + 1; j < tokens.length; j++) {
              const nextToken = tokens[j];
              const nextFirst = first[nextToken];
              nextFirst.forEach((item) => {
                if (item !== "ε") followToken.add(item);
              });

              if (!nextFirst.has("ε")) break;
            }

            if (i === tokens.length - 1 || first[tokens[i + 1]].has("ε")) {
              followSets[lhs].forEach((item) => {
                followToken.add(item);
              });
            }

            if (followToken.size > beforeSize) updated = true;
          }
        }
      });
    }
    setFollow(followSets);
    return followSets;
  }

  async function findClosure(
    augmentedGrammar: Grammar,
    nonTerminalElements: TerminalandNonTerminal
  ) {
    const closures: Closure = {};
    nonTerminalElements.forEach((symbol) => {
      closures[symbol] = [];
    });
    augmentedGrammar.forEach((gm) => {
      for (const symbol in closures) {
        if (symbol === gm[0]) {
          closures[symbol] = [...closures[symbol], gm];
        }
      }
    });

    let updated = true;
    while (updated) {
      updated = false;
      for (const symbol in closures) {
        let newClosure: Grammar = [];
        closures[symbol].forEach(([, rule]) => {
          if (nonTerminalElements.includes(rule[1])) {
            newClosure = [...closures[symbol], ...closures[rule[1]]];
          }
        });
        const unique = Array.from(new Set(newClosure));
        if (unique.length > closures[symbol].length) {
          closures[symbol] = unique;
          updated = true;
        }
      }
    }

    setClosures(closures);
    return closures;
  }

  async function scanNextToken(
    currentState: Grammar,
    token: string,
    terminals: TerminalandNonTerminal,
    nonTerminals: TerminalandNonTerminal,
    closures: Closure
  ): Promise<Grammar> {
    const symbols = [...terminals, ...nonTerminals];
    const nextState: Grammar = [];
    //shifting the prefix symbol to the right
    currentState.forEach(([start, production]) => {
      const prefixIndex = production.indexOf(prefix);
      if (prefixIndex < 0) {
        throw new Error(`The grammar has no ${prefix} prefix(scan symbol).`);
      }

      if (prefixIndex < production.length - 1) {
        let nextSymbolIndex = prefixIndex + 1;
        let nextToken: string = "";
        if (production[nextSymbolIndex] === " ") {
          nextSymbolIndex++;
        }
        while (true) {
          nextToken = production
            .slice(prefixIndex + 1, nextSymbolIndex + 1)
            .split(" ")
            .join("");
          if (symbols.includes(nextToken)) break;
          nextSymbolIndex++;
        }
        if (nextSymbolIndex < production.length && nextToken === token) {
          const newRule = scanNextChar(
            production,
            prefixIndex,
            nextSymbolIndex
          );
          nextState.push([start, newRule]);
        }
      }
    });
    //scan each symbol from the grammar

    const closureToAdd: Set<Grammar> = new Set();
    nextState.forEach((rule) => {
      const prodcution = rule[1].split(" ").join("");
      const prefixIndex = prodcution.indexOf(prefix);
      if (prefixIndex < prodcution.length - 1) {
        const nextSymbol = prodcution[prefixIndex + 1];
        if (nonTerminals.includes(nextSymbol)) {
          closureToAdd.add(closures[nextSymbol]);
        }
      }
    });
    [...closureToAdd].forEach((rule) => nextState.push(...rule));
    // console.log("current state", currentState);
    // console.log("next state", nextState);
    return nextState;
  }

  useEffect(() => {}, [states, transitions]);

  return (
    <GrammarContext.Provider
      value={{
        grammar,
        terminals,
        nonTerminals,
        first,
        follow,
        transitions,
        states,
        closures,
        createGrammar,
        augmentedGrammar,
        finalState,
        prefix,
        conflict,
        setConflict,
      }}
    >
      {children}
    </GrammarContext.Provider>
  );
};

export const useGrammar = function () {
  const context = useContext(GrammarContext);
  if (context == null) {
    throw new Error(
      "Cannot use Grammar context outside GrammarProvider context"
    );
  }
  return context;
};
