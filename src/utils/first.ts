import { FirstFollow, Grammar } from "../types/types";

const epsilon = "ε";

export const first = function (
  grammar: Grammar,
  terminals: string[],
  nonTerminals: string[]
): FirstFollow {
  const first: FirstFollow = {};
  terminals.forEach((symbol) => (first[symbol] = [symbol]));
  nonTerminals.forEach((symbol) => (first[symbol] = []));

  let updated = true;
  while (updated) {
    updated = false;
    grammar.forEach((rule) => {
      const symbol = rule[0];
      const production = rule[1];
      let newFirst: string[] = [];
      if (production === epsilon) {
        newFirst = [production];
      } else if (terminals.includes(production)) {
        newFirst = [production];
      } else {
        for (const token of production) {
          if (terminals.includes(token)) {
            newFirst = [...newFirst, token];
            break;
          } else if (nonTerminals.includes(token)) {
            newFirst = [
              ...newFirst,
              ...first[token].filter((x) => x !== epsilon),
            ];
          }
          if (!first[token].includes(epsilon)) break;
        }
      }

      if (
        production
          .split("")
          .every(
            (token) =>
              nonTerminals.includes(token) && first[token].includes(epsilon)
          )
      ) {
        newFirst.push(epsilon);
      }

      const uniqueFirst = Array.from(new Set([...first[symbol], ...newFirst]));
      //if first of symbole is added update
      if (uniqueFirst.length > first[symbol].length) {
        first[symbol] = uniqueFirst;
        updated = true;
      }
    });
  }

  // console.log(first);
  return first;
};

const testGrammar: Grammar = [
  ["E", "E+T"],
  ["E", "T"],
  ["T", "T*F"],
  ["T", "F"],
  ["F", "(E)"],
  ["F", "id"],
];
const nonTerminals: string[] = ["E", "T", "F"];
const terminals: string[] = ["+", "*", "id", "(", ")"];
first(testGrammar, terminals, nonTerminals);
