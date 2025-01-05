import { createContext, ReactNode, useContext, useState } from "react";
import { FirstFollow, Grammar, TerminalandNonTerminal } from "../types/types";

interface GrammarProviderProps {
  grammar: Grammar;
  terminals: TerminalandNonTerminal;
  nonTerminals: TerminalandNonTerminal;
  first: Record<string, Set<string>>;
  follow: Record<string, Set<string>>;
  augmentedGrammar: Grammar;
  createGrammar: (rawGrammar: string) => void;
}

interface LRItem {
  first: FirstFollow;
  follow: FirstFollow;
  createGrammar: (rawGrammar: string) => void;
}

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

  function augmentGrammarWithDot(
    originalGrammar: Grammar,
    prefix: string
  ): Grammar {
    if (originalGrammar.length === 0) {
      console.error("The grammar is empty and cannot be augmented.");
      return [];
    }

    // Step 1: Get the original start symbol (LHS of the first production)
    const originalStartSymbol = originalGrammar[0][0];

    // Step 2: Define a new start symbol (e.g., `S'`)
    const newStartSymbol = `${originalStartSymbol}'`;

    // Step 3: Create the augmented start rule with the dot
    const augmentedStartRule: [string, string] = [
      newStartSymbol,
      `${prefix}${originalStartSymbol}`,
    ];

    // Step 4: Add the dot at the beginning of every RHS in the original grammar
    const augmentedRules = originalGrammar.map(([lhs, rhs]) => {
      const augmentedRhs = `${prefix}${rhs}`; // Add the dot to the beginning of the RHS
      return [lhs, augmentedRhs];
    });

    // Step 5: Combine the new start rule with the augmented original grammar
    const augmentedGrammar: Grammar = [augmentedStartRule, ...augmentedRules];

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
    const finalGrammar: Grammar = [];

    rules.forEach((rule) => {
      const [lhs, rhs] = rule.split("->").map((part) => part.trim());

      if (!lhs || !rhs) {
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
    const prefix = "•"; // Example prefix (e.g., a dot or another marker)
    const newAugmentedGrammar = augmentGrammarWithDot(finalGrammar, prefix);
    console.log(newAugmentedGrammar);
    setAugmentedGrammar(newAugmentedGrammar);
    // here

    const newFirst = await calculateFirst(
      finalGrammar,
      [...terminalElements],
      [...nonTerminalElements]
    );
    calculateFollow(finalGrammar, newFirst, [...nonTerminalElements]);

    console.log("Final Grammar:", finalGrammar);
    console.log("Terminals:", [...terminalElements]);
    console.log("Non-terminals:", [...nonTerminalElements]);
    console.log("FIRST:", first);
    console.log("FOLLOW:", follow);
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
        if (currentToken && !/[A-Z]/.test(currentToken[0])) {
          tokens.push(currentToken);
          currentToken = "";
        }
        currentToken += char;
      } else {
        if (currentToken && /[A-Z]/.test(currentToken[0])) {
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

  function calculateFollow(
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
  }

  return (
    <GrammarContext.Provider
      value={{
        grammar,
        terminals,
        nonTerminals,
        first,
        follow,
        createGrammar,
        augmentedGrammar,
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
