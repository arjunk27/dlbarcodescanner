import React, { useRef, useEffect, useState } from "react";
import { BrowserMultiFormatReader, BarcodeFormat } from "@zxing/library";
import { Parse } from "aamva-parser";

const Scanner = ({ onSuccess = () => {} }) => {
  const videoRef = useRef(null);
  const [scannedData, setScannedData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const codeReader = new BrowserMultiFormatReader();
    let selectedDeviceId;

    const initializeScanner = async () => {
      try {
        const videoInputDevices = await codeReader.listVideoInputDevices();
        if (videoInputDevices.length === 0) {
          throw new Error("No video input devices found.");
        }

        // Use the first available camera
        selectedDeviceId = videoInputDevices[0].deviceId;

        console.log("Starting scanner with device:", selectedDeviceId);

        // Start decoding from the selected camera
        codeReader.decodeFromVideoDevice(
          selectedDeviceId,
          videoRef.current,
          (result, err) => {
            if (result) {
              console.log("Decoded Result:", result.getText());
              const rawData = result.getText();
              try {
                const parsedData = Parse(rawData); // Parse AAMVA data
                setScannedData(parsedData);
                if (parsedData.firstName) onSuccess(parsedData);
                setError(null);
              } catch (parseError) {
                console.error("Parsing error:", parseError);
                setError("Error parsing data. Please try again.");
              }
            }

            if (err) {
              console.error("Decoding error:", err);
              // Provide feedback for decoding errors
              if (err.name === "NotFoundException") {
                setError("No barcode detected. Please adjust the camera.");
              }
            }
          }
        );
      } catch (err) {
        console.error("Error initializing scanner:", err);
        setError("Error initializing scanner. Check camera permissions.");
      }
    };

    initializeScanner();

    return () => {
      codeReader.reset(); // Stop the scanner on component unmount
    };
  }, []);

  return (
    <div>
      <video ref={videoRef} style={{ width: "100%" }} />
      {scannedData && (
        <div>
          <h3>Scanned Data:</h3>
          <pre>{JSON.stringify(scannedData, null, 2)}</pre>
        </div>
      )}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default Scanner;
