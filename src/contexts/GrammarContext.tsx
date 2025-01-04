import { createContext, ReactNode, useContext, useState } from "react";

interface GrammarProviderProps {
  grammar: string[];
  createGrammar: (rawGrammar: string) => void;
}
const GrammarContext = createContext<GrammarProviderProps | null>(null);

export const GrammarProvider: React.FC<{ children: ReactNode }> = function ({
  children,
}) {
  const [grammar, setGrammar] = useState<string[]>([]);

  function createGrammar(rawGrammar: string) {
    const newGrammar = rawGrammar.split("\n");

    const finalGrammar: string[] = [];

    newGrammar.forEach((rule) => {
      if (rule.includes("|")) {
        const newRule = rule.split("|");
        finalGrammar.push(newRule[0]);
        const nonTerminal = newRule[0][0];
        for (let i = 1; i < newRule.length; i++) {
          finalGrammar.push(`${nonTerminal}->${newRule[i]}`);
        }
      } else {
        finalGrammar.push(rule);
      }
    });
    setGrammar(finalGrammar);
  }

  return (
    <GrammarContext.Provider value={{ grammar, createGrammar }}>
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
