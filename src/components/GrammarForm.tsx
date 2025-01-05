import { useState } from "react";
import { useGrammar } from "../contexts/GrammarContext";

export const GrammarForm = function () {
  const [inputGrammar, setInputGrammar] = useState("");
  const { createGrammar, first, follow } = useGrammar();

  const handleGrammarChange = function (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) {
    setInputGrammar(e.target.value);
  };

  const handleGrammarSubmit = function (e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    console.log("Input Grammar:", inputGrammar);
    createGrammar(inputGrammar);
  };

  const renderSet = (set: Record<string, Set<string>>) => {
    return Object.entries(set).map(([key, values]) => (
      <div key={key}>
        <strong>{key}:</strong> {"{"}
        {Array.from(values).join(", ")}
        {"}"}
      </div>
    ));
  };

  return (
      <>
          <div className= "leftcontainer flex items-center justify-center">
        <label htmlFor="grammar"><b>Enter Grammar:</b></label>
        <form onSubmit={handleGrammarSubmit}>

        <textarea
            className="border-solid border-2 border-sky-500"
            id="grammar"
            value={inputGrammar}
            onChange={handleGrammarChange}
            rows={5}
            cols={30}
            placeholder="Type the grammar here..."
        />
            <br/>
            <div className= "flex items-center justify-center">
                <button
                    className="bg-transparent hover:bg-purple-400 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-purple-300 hover:border-transparent rounded "
                    type="submit">
                    Enter
                </button>
            </div>

        </form>
              <div className="mt-4">
                  <h3 className="font-bold">FIRST Sets:</h3>
                  <div className="ml-4">{renderSet(first)}</div>
              </div>
              <div className="mt-4">
              <h3 className="font-bold">FOLLOW Sets:</h3>
          <div className="ml-4">{renderSet(follow)}</div>
        </div>
          </div>
      </>
  );
};
