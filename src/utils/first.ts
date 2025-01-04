type Grammar = [string, string][];

// firsts {
//     'S': [_, _,_],
//     'C': [_, _, _]
// }
type First = Record<string, string[]>;
export const first = function (
  grammar: Grammar,
  terminals: string[],
  nonTerminals: string[]
) {
  const first: First = {};
  terminals.forEach((terminal) => (first[terminal] = [terminal]));
  console.log(first);
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
