import { useState } from "react";
import { useGrammar } from "../contexts/GrammarContext";

export const GrammarForm = function () {
  const [inputGrammar, setInputGrammar] = useState("");
  const { createGrammar } = useGrammar();

  const handleGrammarChange = function (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) {
    setInputGrammar(e.target.value);
  };

  const handleGrammarSubmit = function (e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    console.log(inputGrammar);
    createGrammar(inputGrammar.replace(/\s+/g, ""));
  };

  return (
    <>
      <form onSubmit={handleGrammarSubmit}>
        <label htmlFor="grammar">Enter Grammar:</label>
        <textarea
          className="border-solid border-2 border-sky-500"
          id="grammar"
          value={inputGrammar}
          onChange={handleGrammarChange}
          rows={5}
          cols={30}
          placeholder="Type the grammar here..."
        />
        <button className="border-solid border-2 border-sky-500" type="submit">
          Enter
        </button>
      </form>
    </>
  );
};
