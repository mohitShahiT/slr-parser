import { GrammarForm } from "./components/GrammarForm"

function App() {
  return (
    <>
        <div className="title-holder">
            <h1 className=" text-center text-3xl font-bold">
                SLR Parser
            </h1>
        </div>

        <div>
            <GrammarForm/>
        </div>
    </>
  )
}

export default App
