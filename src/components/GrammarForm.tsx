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
    createGrammar(inputGrammar);
  };

  return (
      <>
        <div className= "">
          <p>GRAMMAR FORM</p>
        <label htmlFor="grammar">Enter Grammar:</label>
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
          <button className="border-solid border-2 border-sky-500" type="submit">
            Enter
          </button>
        </form>
        </div>
      </>
  );
};
