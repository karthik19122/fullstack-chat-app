import React, { useState } from "react";
import axios from "axios";

// Function to upload file to the server
export const uploadFile = async (file) => {
  if (!file) return null;

  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await axios.post("http://localhost:5001/api/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    console.log("File upload successful:", response.data);
    return response.data;  // response.data contains the file URL
  } catch (err) {
    console.error("File upload failed:", err);
    return null;
  }
};

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [fileUrl, setFileUrl] = useState("");
  const [error, setError] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // Function to validate file type and size
  const validateFile = (file) => {
    const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "video/mp4"];
    const maxSize = 1024 * 1024 * 1000; // 1GB

    if (!allowedTypes.includes(file.type)) {
      return "Invalid file type. Only PDF, JPEG, PNG, and MP4 files are allowed.";
    }

    if (file.size > maxSize) {
      return "File size exceeds the 1GB limit.";
    }

    return null;
  };

  // Handle file selection change
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    const validationError = validateFile(selectedFile);

    if (validationError) {
      setError(validationError);
      setFile(null);
    } else {
      setFile(selectedFile);
      setError("");
    }
  };

  // Handle file upload to the server
  const handleFileUpload = async () => {
    if (!file) {
      setError("No file selected.");
      return;
    }

    setIsUploading(true);
    const response = await uploadFile(file);
    setIsUploading(false);

    if (response && response.fileUrl) {
      setFileUrl(response.fileUrl); // The URL is in response.fileUrl
      setError("");
    } else {
      setError("File upload failed. Please try again.");
    }
  };

  return (
    <div>
      <h2>Upload a File</h2>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleFileUpload} disabled={!file || isUploading}>
        {isUploading ? "Uploading..." : "Upload"}
      </button>

      {/* Display uploaded file's URL and preview */}
      {fileUrl && (
        <div>
          <h3>File uploaded successfully!</h3>
          <a href={fileUrl} target="_blank" rel="noopener noreferrer">
            {fileUrl}
          </a>
          <br />
          {/* Preview PDF */}
          {fileUrl.endsWith(".pdf") && (
            <iframe
              src={fileUrl}
              width="600"
              height="400"
              title="file-preview"
              style={{ border: "1px solid #ccc" }}
            />
          )}
          {/* Preview Image files (JPG, PNG) */}
          {(fileUrl.endsWith(".jpg") || fileUrl.endsWith(".jpeg") || fileUrl.endsWith(".png")) && (
            <img
              src={fileUrl}
              alt="Uploaded File"
              width="600"
              height="400"
            />
          )}
          {/* Preview Video file */}
          {fileUrl.endsWith(".mp4") && (
            <video width="600" height="400" controls>
              <source src={fileUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          )}
        </div>
      )}

      {/* Display error message if any */}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default FileUpload;
