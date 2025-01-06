import { useState } from "react";
import "./App.css";
import DLBarcodeScanner from "./components/Scanner";

function App() {
  const [open, setOpen] = useState(false);
  return (
    <div className="App">
      dl barcode scanner
      <button onClick={() => setOpen(!open)}>{open ? "close" : "open"}</button>
      <div style={{ width: "600px", height: "100px", margin: "10px 100px" }}>
        {open && <DLBarcodeScanner />}
      </div>
    </div>
  );
}

export default App;
