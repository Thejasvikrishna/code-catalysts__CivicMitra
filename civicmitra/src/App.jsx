import React from "react";
import Dashboard from "./components/dashboard/Dashboard";

function App() {
  return (
    <div>
      <Dashboard issues={[]} onUpvote={() => {}} />
    </div>
  );
}

export default App;