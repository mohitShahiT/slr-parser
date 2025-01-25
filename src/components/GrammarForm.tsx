import { useEffect, useState } from "react";
import { useGrammar } from "../contexts/GrammarContext";
import DFACanvas from "./DFACanvas";
import { State, StateTransition, Grammar, FirstFollow } from "../types/types";

type ParsingTable = string[][]; // The SLR parsing table

function createSLRParsingTable(
  states: State[], // States of the parser
  transitions: StateTransition[], // Transitions between states
  grammar: Grammar, // Grammar rules
  follow: FirstFollow,
  terminals: string[], // Terminal symbols
  nonTerminals: string[], // Non-terminal symbols
  prefix: string,
  finalState: number | undefined,
  setConflict: (val: bool) => void
): ParsingTable {
  const table: ParsingTable = [];
  const headers = ["State", ...terminals, "$", ...nonTerminals];
  table.push(headers);

  for (let stateIndex = 0; stateIndex < states.length; stateIndex++) {
    const row: string[] = new Array(headers.length).fill("");
    row[0] = stateIndex.toString(); // Add the state number

    // Handle transitions (shifts)
    transitions.forEach((transition) => {
      if (transition.from === stateIndex) {
        const colIndex = headers.indexOf(transition.scanned);
        if (colIndex !== -1) {
          const topush = terminals.includes(transition.scanned)
            ? `s${transition.to}`
            : transition.to.toString();
          row[colIndex] = topush;
        }
      }
    });
    if (stateIndex === finalState) {
      row[headers.indexOf("$")] = "accept";
    }

    // Handle reductions
    const items = states[stateIndex];
    Object.entries(items).forEach(([_, rules]) => {
      rules.forEach(([lhs, rhs]) => {
        if (rhs.endsWith(prefix)) {
          // Found a complete item (e.g., "E → E+T.")
          const productionIndex = grammar.findIndex(
            ([l, r]) => l === lhs && r === rhs.slice(0, -1)
          );
          if (productionIndex !== -1) {
            follow[lhs].forEach((symbol) => {
              const colIndex = headers.indexOf(symbol);
              if (colIndex !== -1) {
                if (row[colIndex] === "") {
                  row[colIndex] = `r${productionIndex}`;
                } else {
                  row[colIndex] += `/r${productionIndex}`;
                  setConflict(true);
                }
              }
            });
          }
        }
      });
    });

    table.push(row);
  }

  table.shift();

  return table;
}

export const GrammarForm = function () {
  const [inputGrammar, setInputGrammar] = useState(`S -> E
E -> E + T | T
T -> T * F | F
F -> id`);
  const [inputString, setInputString] = useState("id + id");
  const {
    createGrammar,
    first,
    follow,
    finalState,
    terminals,
    nonTerminals,
    states,
    transitions,
    grammar,
    prefix,
    conflict,
    setConflict,
  } = useGrammar();
  const [showFirstFollow, setShowFirstFollow] = useState(false);
  const [showActionGoto, setShowActionGoto] = useState(false);
  const [showStack, setShowStack] = useState(false);
  const [tableData, setTableData] = useState<string[][]>([]);
  const [tableHeaders, setTableHeaders] = useState<string[]>([]);
  const [parsingStackData, setParsingStackData] = useState<string[][]>([]);
  const handleGrammarChange = function (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) {
    setInputGrammar(e.target.value);
  };
  const handleInputChange = function (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) {
    setInputString(e.target.value);
  };
  const handleGrammarSubmit = function (e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    createGrammar(inputGrammar);
    setShowFirstFollow(true);
    setShowActionGoto(true);
    setShowStack(false);
  };
  const handleViewStack = () => {
    if (grammar.length <= 0) return;
    const inputStack = inputString.trim().split(" ");
    parseString(inputStack);
    setShowStack(true);
  };

  useEffect(() => {
    const tableDatatemp = createSLRParsingTable(
      states,
      transitions,
      grammar,
      follow,
      terminals,
      nonTerminals,
      prefix,
      finalState,
      setConflict
    );
    setTableData(tableDatatemp);
    setTableHeaders(["State", ...terminals, "$", ...nonTerminals]);
  }, [
    states,
    transitions,
    terminals,
    nonTerminals,
    prefix,
    grammar,
    follow,
    finalState,
    setConflict,
  ]);

  function parseString(inputString: string[]) {
    if (!inputString.every((token) => terminals.includes(token))) {
      console.log("Invalid input");
      return;
    }
    const inputStack = [...inputString, "$"];
    const stack = ["0"];
    let index = 1;
    let tempStackData: string[][] = [];
    while (true) {
      const state = Number(stack[stack.length - 1]);
      const token = inputStack[0];
      const action = tableData[state][tableHeaders.indexOf(token)];
      let actionString = "";
      const stackData = [`${index}`, stack.join(" "), inputStack.join(" ")];

      if (action[0] === "s") {
        stack.push(token);
        stack.push(action[1]);
        actionString = `Shift(${action})`;
        inputStack.shift();
      } else if (action[0] === "r") {
        const rule = grammar[Number(action[1])];
        for (let i = 0; i < 2 * rule[1].split(" ").length; i++) {
          stack.pop();
        }

        stack.push(rule[0]);
        const index = Number(stack[stack.length - 2]);
        stack.push(tableData[index][tableHeaders.indexOf(rule[0])]);
        actionString = `Reduce(${action}) by ${rule[0]}->${rule[1]}`;
      } else {
        console.log(stack, "before break");
        break;
      }
      stackData.push(actionString);
      tempStackData = [...tempStackData, stackData];
      index++;
    }
    const state = Number(stack[stack.length - 1]);
    const token = inputStack[0];
    const action = tableData[state][tableHeaders.indexOf(token)];
    tempStackData.push([`${index}`, stack.join(" "), inputStack.join(" ")]);
    if (action === "accept") {
      tempStackData[tempStackData.length - 1].push("Accept");
    } else {
      tempStackData[tempStackData.length - 1].push("Reject");
    }
    setParsingStackData(tempStackData);

    // console.log("token", token, newString);
    // console.log(tableHeaders.indexOf());
    // while (true) {}
    // console.log(string2Parse);
  }

  const renderTable = (data: string[][], headers: string[]) => {
    return (
      <div className="overflow-x-auto rounded-lg shadow-md">
        <table className="min-w-full bg-white border border-gray-300 rounded-lg">
          <thead className="bg-gray-100">
            <tr>
              {headers.map((header, index) => (
                <th
                  key={index}
                  className="py-2 px-4 border-b border-gray-300 text-left font-semibold text-gray-700"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className={rowIndex % 2 === 0 ? "bg-gray-50" : ""}
              >
                {row.map((cell, cellIndex) => (
                  <td
                    key={cellIndex}
                    className="py-2 px-4 border-b border-gray-300 text-gray-700"
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };
  const renderFirstFollowTable = (
    data: Record<string, Set<string>>,
    title: string
  ) => {
    const tableData = Object.entries(data).map(([key, values]) => [
      key,
      Array.from(values).join(", "),
    ]);
    return (
      <div className="mb-4">
        <h3 className="text-xl font-bold mb-2 text-center">{title}</h3>
        {renderTable(tableData, ["Symbol", "Set"])}
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-[#e0d5f4]">
      {/* Left Container */}
      <div className="w-2/5 p-8 flex flex-col items-center">
        {/* Grammar Input */}
        <div className="mb-8 w-full">
          <label
            htmlFor="grammar"
            className="block text-gray-700 font-bold mb-2"
          >
            <b>Enter Grammar:</b>
          </label>
          <form
            onSubmit={handleGrammarSubmit}
            className="flex flex-col items-center w-full"
          >
            <textarea
              className="border-2 border-sky-500 p-2 rounded w-full mb-2"
              id="grammar"
              value={inputGrammar}
              onChange={handleGrammarChange}
              rows={10}
              placeholder="Type the grammar here..."
            />
            <div className="flex justify-center space-x-4 w-full">
              <button
                className=" w-full bg-gradient-to-r from-[#a48ad4] to-[#7554ad] hover:from-[#7554ad] hover:to-[#a48ad4] text-white font-semibold py-2 px-4 rounded transition-colors duration-300"
                type="submit"
              >
                Parse grammar
              </button>
            </div>
          </form>
        </div>
        {/* Input String */}
        <div className="mb-8 w-full">
          <label
            htmlFor="inputString"
            className="block text-gray-700 font-bold mb-2"
          >
            <b>Enter Input String:</b>
          </label>
          <textarea
            className="border-2 border-sky-500 p-2 rounded w-full mb-2"
            id="inputString"
            value={inputString}
            onChange={handleInputChange}
            rows={8}
            placeholder="Type input string here..."
          />
          <button
            disabled={conflict}
            onClick={handleViewStack}
            className="bg-gradient-to-r from-[#a48ad4] to-[#7554ad] hover:from-[#7554ad] hover:to-[#a48ad4] text-white font-semibold py-2 px-4 rounded transition-colors duration-300 w-full"
          >
            {conflict ? "Can't parse as the grammer is not SLR" : "View Stack"}
          </button>
        </div>
        {/* Rules  */}
        {grammar.length > 0 && (
          <div>
            {grammar.map(([lhs, rhs], i) => {
              return <p key={i}>{`r${i}: ${lhs}->${rhs}`}</p>;
            })}
          </div>
        )}
      </div>
      {/* Right Container */}
      <div className="w-3/5 p-8 flex flex-col bg-[#e8d9f2] rounded-lg m-4 overflow-y-auto">
        <div className="sticky top-0 bg-[#e8d9f2] z-10 mb-6">
          {/* <div className="text-center mb-6"> */}
          {/* <h1 className="text-3xl font-bold text-gray-800">SLR Parser</h1> */}
          {/* <p className="text-gray-600">Analyze your grammar with ease.</p> */}
          {/* </div> */}
        </div>
        {showFirstFollow && (
          <div className="bg-white p-4 rounded-lg shadow-md mb-4">
            {renderFirstFollowTable(first, "FIRST Sets")}
            {renderFirstFollowTable(follow, "FOLLOW Sets")}
            {<DFACanvas />}
          </div>
        )}
        {showActionGoto && (
          <div className="bg-white p-4 rounded-lg shadow-md mb-4">
            <h3 className="text-xl font-bold mb-4 text-center">
              ACTION-GOTO Table:
            </h3>
            <div className="text-left">
              {renderTable(
                tableData,
                // [
                //   ["0", "s5", "", "", "", "1", "2", "3"],
                //   ["1", "", "s6", "", "acc", "", "", ""],
                //   ["2", "", "r3", "s7", "r3", "", "", ""],
                //   ["3", "", "r5", "r5", "r5", "", "", ""],
                //   ["4", "s5", "", "", "", "", "8", "3"],
                //   ["5", "", "r6", "r6", "r6", "", "", ""],
                //   ["6", "s5", "", "", "", "", "9", "3"],
                //   ["7", "s5", "", "", "", "", "", "10"],
                //   ["8", "", "r2", "s7", "r2", "", "", ""],
                //   ["9", "", "r4", "r4", "r4", "", "", ""],
                //   ["10", "", "r1", "r1", "r1", "", "", ""],
                // ],
                // ["State", ...terminals, "$", ...nonTerminals]
                tableHeaders
              )}
            </div>
          </div>
        )}

        {showStack && (
          <div className="bg-white p-4 rounded-lg shadow-md mb-4">
            <h3 className="text-xl font-bold mb-4 text-center">
              Parsing Stack:
            </h3>
            <div className="text-left">
              {renderTable(
                parsingStackData,
                // [
                //   ["1", "0", "id$", "s3"],
                //   ["2", "0id3", "$", "r2"],
                //   ["3", "0F2", "$", "r1"],
                //   ["4", "0E1", "$", "acc"],
                // ],
                ["S.N.", "Stack", "Input", "Action"]
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
