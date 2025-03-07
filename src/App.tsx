import { GrammarForm } from "./components/GrammarForm"

function App() {
  return (
    <>
      <div className="title-holder flex items-center flex-col">
        <h1 className=" text-center text-3xl font-bold pt-3">SLR Parser</h1>
        <div className="mb-2">
          <a href="https://github.com/mohitShahiT/slr-parser" target="blank">
            <img className="h-8" src="/github-icon.png"></img>
          </a>
        </div>
      </div>

      <div>
        <GrammarForm />
      </div>
    </>
  );
}


export default App
