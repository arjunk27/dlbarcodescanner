import { useState } from "react";
import "./App.css";
import DLBarcodeScanner from "./components/Scanner";

function App() {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState();

  const handleSuccess = (val) => {
    setOpen(false);
    setData(val);
  };

  return (
    <div className="App">
      dl barcode scanner
      <button onClick={() => setOpen(!open)}>{open ? "close" : "open"}</button>
      <div style={{ width: "600px", height: "100px", margin: "10px 100px" }}>
        {open ? (
          <DLBarcodeScanner onSuccess={handleSuccess} />
        ) : (
          data && (
            <div>
              <h3>Scanned Data:</h3>
              <pre>{JSON.stringify(data, null, 2)}</pre>
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default App;
