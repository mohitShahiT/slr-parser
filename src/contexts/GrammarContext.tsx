import { createContext, ReactNode, useContext, useState } from "react";
import {FirstFollow, Grammar, TerminalandNonTerminal} from "../types/types";

interface GrammarProviderProps {
  grammar: Grammar;
  terminals: TerminalandNonTerminal;
  nonTerminals: TerminalandNonTerminal;
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

  function createGrammar(rawGrammar: string) {
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

    calculateFirst(finalGrammar, [...terminalElements], [...nonTerminalElements]);
    calculateFollow(finalGrammar, [...terminalElements], [...nonTerminalElements]);

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

  function calculateFirst(
    grammar: Grammar,
    terminals: string[],
    nonTerminals: string[]
  ) 
  {
    const firstSets: Record<string, Set<string>> = {};
  
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
  
    setFirst(firstSets);
    
  }
    

  function calculateFollow(
    grammar: Grammar,
    terminals: string[],
    nonTerminals: string[]
  ) {
    const followSets: Record<string, Set<string>> = {};

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
      value={{ grammar, terminals, nonTerminals, first, follow, createGrammar }}
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
