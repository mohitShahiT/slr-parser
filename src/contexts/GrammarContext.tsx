import { createContext, ReactNode, useContext, useState } from "react";
import { Grammar } from "../types/types";
interface GrammarProviderProps {
  grammar: Grammar;
  createGrammar: (rawGrammar: string) => void;
}
const GrammarContext = createContext<GrammarProviderProps | null>(null);

export const GrammarProvider: React.FC<{ children: ReactNode }> = function ({
  children,
}) {
  const [grammar, setGrammar] = useState<Grammar>([]);

  function createGrammar(rawGrammar: string) {
    // Normalize whitespace and fix additional spaces around grammar symbols
    const normalizedGrammar = rawGrammar
      .replace(/\s*->\s*/g, " -> ") // Normalize spaces around "->"
      .replace(/\s*\|\s*/g, " | ") // Normalize spaces around "|"
      .replace(/\s+/g, " ") // Replace multiple spaces with a single space
      .trim();

    const rules = normalizedGrammar.split(/ (?=[A-Z]+ ->)/); // Split rules based on "LHS ->"

<<<<<<< HEAD
    const finalGrammar: string[][] = [];
=======
    console.log(`Raw grammar is ${rawGrammar}`);
    console.log(`new Grammar is ${newGrammar}`);
    const finalGrammar: Grammar = [];
>>>>>>> 3853a2c1799bcfb1500916f8066d3c56ec2aa03f

    rules.forEach((rule) => {
      const [lhs, rhs] = rule.split("->").map((part) => part.trim()); // Split LHS and RHS

      if (!lhs || !rhs) {
        console.warn(`Skipping invalid rule: ${rule}`);
        return; // Skip invalid rules without throwing an error
      }

      // Split RHS by "|" to handle multiple options
      const rhsOptions = rhs.split("|").map((option) => option.trim());

      rhsOptions.forEach((rhsi) => {
        finalGrammar.push([lhs, rhsi]);
      });
    });

    // Finalize grammar
    setGrammar(finalGrammar);
    console.log("Final Grammar:", finalGrammar);
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
