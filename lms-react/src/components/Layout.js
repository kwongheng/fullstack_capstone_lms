import { useState } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";

export default function Layout({ children }) {
  const [resetTrigger, setResetTrigger] = useState(0);

  const resetSidebar = () => setResetTrigger((v) => v + 1);

  return (
    <div style={{ display: "flex" }}>
      <Sidebar resetTrigger={resetTrigger} />

      <div style={{ flex: 1 }}>
        <Header resetSidebar={resetSidebar} />
        <main style={{ padding: "20px" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
