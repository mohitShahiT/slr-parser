import { useState } from "react";
import { useGrammar } from "../contexts/GrammarContext";

export const GrammarForm = function () {
    const [inputGrammar, setInputGrammar] = useState("");
    const [inputString, setInputString] = useState("");
    const { createGrammar, first, follow } = useGrammar();
    const [showFirstFollow, setShowFirstFollow] = useState(false);
    const [showActionGoto, setShowActionGoto] = useState(false);
    const [showStack, setShowStack] = useState(false);
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
        setShowActionGoto(false);
        setShowStack(false);
    };
    const handleViewLrItems = () => {
        setShowActionGoto(true)
        setShowFirstFollow(false);
        setShowStack(false);
    }
    const handleViewStack = () => {
        setShowStack(true);
        setShowFirstFollow(false);
        setShowActionGoto(false);
    }
    const renderTable = (data: any[][], headers: string[]) => {
        return (
            <div className="overflow-x-auto rounded-lg shadow-md">
                <table className="min-w-full bg-white border border-gray-300 rounded-lg">
                    <thead className="bg-gray-100">
                    <tr>
                        {headers.map((header, index) => (
                            <th key={index} className="py-2 px-4 border-b border-gray-300 text-left font-semibold text-gray-700">{header}</th>
                        ))}
                    </tr>
                    </thead>
                    <tbody>
                    {data.map((row, rowIndex) => (
                        <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-gray-50' : ''}>
                            {row.map((cell, cellIndex) => (
                                <td key={cellIndex} className="py-2 px-4 border-b border-gray-300 text-gray-700">{cell}</td>
                            ))}
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        )
    }
  const renderFirstFollowTable = (data: Record<string, Set<string>>, title: string) => {
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
                    <label htmlFor="grammar" className="block text-gray-700 font-bold mb-2">
                        <b>Enter Grammar:</b>
                    </label>
                    <form onSubmit={handleGrammarSubmit} className="flex flex-col items-center w-full">
                        <textarea
                            className="border-2 border-sky-500 p-2 rounded w-full mb-2"
                            id="grammar"
                            value={inputGrammar}
                            onChange={handleGrammarChange}
                            rows={5}
                            placeholder="Type the grammar here..."
                        />
                        <div className="flex justify-center space-x-4">
                            <button
                                className="bg-gradient-to-r from-[#a48ad4] to-[#7554ad] hover:from-[#7554ad] hover:to-[#a48ad4] text-white font-semibold py-2 px-4 rounded transition-colors duration-300"
                                type="submit"
                            >
                                Parse grammar
                            </button>
                            <button
                                onClick={handleViewLrItems}
                                className="bg-gradient-to-r from-[#a48ad4] to-[#7554ad] hover:from-[#7554ad] hover:to-[#a48ad4] text-white font-semibold py-2 px-4 rounded transition-colors duration-300"
                            >
                                View LR(0) Items
                            </button>
                        </div>
                    </form>
                </div>
                {/* Input String */}
                <div className="mb-8 w-full">
                    <label htmlFor="inputString" className="block text-gray-700 font-bold mb-2">
                        <b>Enter Input String:</b>
                    </label>
                    <textarea
                        className="border-2 border-sky-500 p-2 rounded w-full mb-2"
                        id="inputString"
                        value={inputString}
                        onChange={handleInputChange}
                        rows={3}
                        placeholder="Type input string here..."
                    />
                    <button
                        onClick={handleViewStack}
                        className="bg-gradient-to-r from-[#a48ad4] to-[#7554ad] hover:from-[#7554ad] hover:to-[#a48ad4] text-white font-semibold py-2 px-4 rounded transition-colors duration-300 w-full"
                    >
                        View Stack
                    </button>
                </div>
            </div>
            {/* Right Container */}
            <div className="w-3/5 p-8 flex flex-col bg-[#e8d9f2] rounded-lg m-4 overflow-y-auto">
                 <div className="sticky top-0 bg-[#e8d9f2] z-10 mb-6">
                        <div className="text-center mb-6">
                            <h1 className="text-3xl font-bold text-gray-800 mb-2">
                                SLR Parser
                            </h1>
                            <p className="text-gray-600">
                                Analyze your grammar with ease.
                            </p>
                        </div>
                    </div>
                {showFirstFollow && (
                  <div className="bg-white p-4 rounded-lg shadow-md mb-4">
                    {renderFirstFollowTable(first, "FIRST Sets")}
                    {renderFirstFollowTable(follow, "FOLLOW Sets")}
                </div>

                )}
                {showActionGoto && (
                    <div className="bg-white p-4 rounded-lg shadow-md mb-4">
                        <h3 className="text-xl font-bold mb-4 text-center">ACTION GOTO Table:</h3>
                            <div className="text-left">
                                {renderTable([["0", "s3", "", "1", "2"], ["1", "", "acc", "", ""], ["2", "", "", "", ""],["3", "r2", "", "", ""]], ["States", "id", "$", "E", "F"])}
                        </div>
                    </div>
                )}
                {showStack && (
                    <div className="bg-white p-4 rounded-lg shadow-md mb-4">
                        <h3 className="text-xl font-bold mb-4 text-center">Parsing Stack:</h3>
                        <div className="text-left">
                                {renderTable([["1", "0", "id$", "s3"], ["2", "0id3", "$", "r2"],["3", "0F2", "$","r1"],["4", "0E1", "$", "acc"]], ["S.N.", "Stack", "Input", "Action"])}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};