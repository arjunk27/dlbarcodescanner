import React, { useRef, useEffect, useState } from "react";
import { BrowserMultiFormatReader, BarcodeFormat } from "@zxing/library";
import { Parse } from "aamva-parser";

const Scanner = ({ onSuccess = () => {} }) => {
  const videoRef = useRef(null);
  const [scannedData, setScannedData] = useState(null);
  const [error, setError] = useState(null);
  let mediaStream = null; // Track the video stream

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
                if (parsedData.firstName) {
                  onSuccess(parsedData);
                  stopCamera(); // Stop the camera after successful scan
                }
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

        // Capture the media stream for stopping later
        mediaStream = videoRef.current?.srcObject;
      } catch (err) {
        console.error("Error initializing scanner:", err);
        setError("Error initializing scanner. Check camera permissions.");
      }
    };

    initializeScanner();

    // Stop the camera when the component unmounts or scanning is completed
    return () => {
      stopCamera();
      codeReader.reset();
    };
  }, []);

  const stopCamera = () => {
    if (mediaStream) {
      const tracks = mediaStream.getTracks();
      tracks.forEach((track) => {
        track.stop(); // Stop each track
        console.log("Track stopped:", track);
      });
      if (videoRef.current) {
        videoRef.current.srcObject = null; // Explicitly set the video source to null
      }
      mediaStream = null;
    }
  };

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
