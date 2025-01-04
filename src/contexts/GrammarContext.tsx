import { createContext, ReactNode, useContext, useState } from "react";
import { Grammar, TerminalandNonTerminal } from "../types/types";

interface GrammarProviderProps {
  grammar: Grammar;
  terminals: TerminalandNonTerminal;
  nonTerminals: TerminalandNonTerminal;
  createGrammar: (rawGrammar: string) => void;
}

const GrammarContext = createContext<GrammarProviderProps | null>(null);

export const GrammarProvider: React.FC<{ children: ReactNode }> = function ({
  children,
}) {
  const [grammar, setGrammar] = useState<Grammar>([]);
  const [terminals, setTerminals] = useState<TerminalandNonTerminal>([]);
  const [nonTerminals, setNonTerminals] = useState<TerminalandNonTerminal>([]);

  function createGrammar(rawGrammar: string) {
    const terminalElements: Set<string> = new Set();
    const nonTerminalElements: Set<string> = new Set();

    // Normalize whitespace and fix additional spaces around grammar symbols
    const normalizedGrammar = rawGrammar
      .replace(/\s*->\s*/g, " -> ") // Normalize spaces around "->"
      .replace(/\s*\|\s*/g, " | ") // Normalize spaces around "|"
      .replace(/\s+/g, " ") // Replace multiple spaces with a single space
      .trim();

    // Split rules based on uppercase letters followed by "->"
    const rules = normalizedGrammar.split(/ (?=[A-Z]+ ->)/);
    const finalGrammar: Grammar = [];

    rules.forEach((rule) => {
      const [lhs, rhs] = rule.split("->").map((part) => part.trim());

      if (!lhs || !rhs) {
        console.warn(`Skipping invalid rule: ${rule}`);
        return;
      }

      // Add LHS to non-terminals
      nonTerminalElements.add(lhs);

      // Split RHS by "|" to handle multiple options
      const rhsOptions = rhs.split("|").map((option) => option.trim());

      rhsOptions.forEach((rhsOption) => {
        finalGrammar.push([lhs, rhsOption]);

        // Process RHS to identify terminals and non-terminals
        const tokens = tokenizeRHS(rhsOption);
        tokens.forEach((token) => {
          // If token is uppercase, it's a non-terminal
          if (/^[A-Z]+$/.test(token)) {
            nonTerminalElements.add(token);
          } else {
            // If token is not a non-terminal, it's a terminal
            terminalElements.add(token);
          }
        });
      });
    });

    setGrammar(finalGrammar);
    setTerminals([...terminalElements]);
    setNonTerminals([...nonTerminalElements]);

    console.log("Final Grammar:", finalGrammar);
    console.log("Terminals:", [...terminalElements]);
    console.log("Non-terminals:", [...nonTerminalElements]);
  }

  // Helper function to tokenize RHS of grammar rules
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
        // Handle non-terminals (uppercase letters)
        if (currentToken && !/[A-Z]/.test(currentToken[0])) {
          tokens.push(currentToken);
          currentToken = "";
        }
        currentToken += char;
      } else {
        // Handle terminals
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

  return (
    <GrammarContext.Provider
      value={{ grammar, terminals, nonTerminals, createGrammar }}
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
