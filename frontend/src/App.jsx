import { useState } from "react";

import LandingPage from "./components/LandingPage.jsx";
import SetupPage from "./components/SetupPage.jsx";
import ResultPage from "./components/ResultPage.jsx";

export default function App() {
  const [screen, setScreen] = useState("home");

  const [config, setConfig] = useState({
    method: "global",
    sequence1: "",
    sequence2: "",
    match: 2,
    mismatch: -1,
    gap: -2,
  });

  const [result, setResult] = useState(null);

  function handleStart() {
    setScreen("setup");
  }

  function handleBackHome() {
    setScreen("home");
  }

  function handleBackSetup() {
    setScreen("setup");
  }

  function handleResult(data) {
    setResult(data);
    setScreen("result");
  }

  return (
    <div className="app">
      {screen === "home" && (
        <LandingPage onStart={handleStart} />
      )}

      {screen === "setup" && (
        <SetupPage
          config={config}
          setConfig={setConfig}
          onBack={handleBackHome}
          onResult={handleResult}
        />
      )}

      {screen === "result" && (
        <ResultPage
          config={config}
          result={result}
          onBack={handleBackSetup}
          onHome={handleBackHome}
        />
      )}
    </div>
  );
}