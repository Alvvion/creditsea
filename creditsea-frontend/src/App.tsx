/* eslint-disable @typescript-eslint/no-explicit-any */
import { CodeBracketSquareIcon } from "@heroicons/react/24/solid";
import { useState, useRef } from "react";
import axios from "axios";

function App() {
  const [dragOver, setDragOver] = useState(false);
  const [, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [uploadComplete, setUploadComplete] = useState<boolean>(false);
  const [reportData, setReportData] = useState<any | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append("xmlData", file);

    setUploading(true);
    setProgress(0);
    setUploadComplete(false);

    try {
      const response = await axios.post(
        "https://creditsea-t1z9.onrender.com/upload",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / (progressEvent.total || 1)
            );
            setProgress(percentCompleted);
          },
        }
      );

      setUploadComplete(true);
      setReportData(response.data.data);
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload failed. Please check the console or backend server.");
    } finally {
      setUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === "text/xml") {
      setFile(droppedFile);
      uploadFile(droppedFile);
    } else {
      alert("Please upload a valid XML file");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === "text/xml") {
      setFile(selectedFile);
      uploadFile(selectedFile);
    } else {
      alert("Please upload a valid XML file");
    }
  };

  const camelCaseToTitleCase = (camelCase: string) => {
    if (!camelCase) return "";

    // Insert space before each uppercase letter (except start)
    const spaced = camelCase.replace(/([A-Z])/g, " $1");

    // Capitalize first letter of the spaced string
    const result = spaced.charAt(0).toUpperCase() + spaced.slice(1);

    return result;
  };

  return (
    <>
      <div className="flex flex-col justify-center items-center bg-gradient-to-br from-[#667eea] to-[#764ba2] min-h-screen overflow-hidden">
        <div
          className={`mt-2 flex justify-center rounded-lg border-4 border-dashed px-6 py-10 w-full max-w-2xl cursor-pointer transition-all duration-300 ${
            dragOver
              ? "border-white bg-white/20"
              : "border-white/25 bg-white/10"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="text-center">
            <CodeBracketSquareIcon
              aria-hidden="true"
              className="mx-auto size-12 text-gray-300"
            />
            <div className="mt-4 flex text-sm text-white">
              <label htmlFor="file-upload" className="">
                <input
                  id="file-upload"
                  ref={fileInputRef}
                  name="file-upload"
                  type="file"
                  accept=".xml"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
              <p className="pl-1 text-xl font-semibold text-white">
                Drop files here or click to upload
              </p>
            </div>
            <p className="text-xs/5 text-white/50">Only XML up to 10MB</p>
          </div>
        </div>
        {uploading && (
          <div className="mt-6 w-full max-w-2xl">
            <div className="w-full bg-white/20 rounded-full h-3">
              <div
                className="bg-green-400 h-3 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-center mt-2 text-white">
              {progress}% Uploading...
            </p>
          </div>
        )}

        {uploadComplete && reportData && (
          <div className="mt-8 w-full max-w-4xl bg-white/10 backdrop-blur-lg rounded-xl p-6 text-white border border-white/20 space-y-6">
            {/* Basic Details */}
            <section>
              <h3 className="text-2xl font-semibold mb-3 text-center text-white/90">
                Basic Details
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {Object.entries(reportData.basicDetails || {}).map(
                  ([key, value]) => (
                    <div
                      key={key}
                      className="bg-white/10 p-3 rounded-lg text-center"
                    >
                      <p className="text-sm text-white/70 capitalize">
                        {camelCaseToTitleCase(key)}
                      </p>
                      <p className="font-semibold text-white">
                        {String(value)}
                      </p>
                    </div>
                  )
                )}
              </div>
            </section>

            {/* Report Summary */}
            <section>
              <h3 className="text-2xl font-semibold mb-3 text-center text-white/90">
                Report Summary
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {Object.entries(reportData.reportSummary || {}).map(
                  ([key, value]) => (
                    <div
                      key={key}
                      className="bg-white/10 p-3 rounded-lg text-center"
                    >
                      <p className="text-sm text-white/70 capitalize">
                        {camelCaseToTitleCase(key)}
                      </p>
                      <p className="font-semibold text-white">
                        {String(value)}
                      </p>
                    </div>
                  )
                )}
              </div>
            </section>

            {/* Credit Accounts */}
            <section>
              <h3 className="text-2xl font-semibold mb-3 text-center text-white/90">
                Credit Accounts
              </h3>
              {reportData.creditAccounts &&
              reportData.creditAccounts.length > 0 ? (
                <div className="space-y-4">
                  {reportData.creditAccounts.map((acc: any, idx: number) => (
                    <div
                      key={idx}
                      className="bg-white/10 border border-white/10 rounded-lg p-4 shadow-md"
                    >
                      <h4 className="text-lg font-semibold text-green-300 mb-2">
                        {acc.creditCard?.bankName || "Bank"} —{" "}
                        {acc.creditCard?.accountType || ""}
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 text-sm">
                        {Object.entries(acc).map(([key, value]) => {
                          if (typeof value === "object" && value !== null) {
                            return (
                              <div
                                key={key}
                                className="col-span-2 bg-white/5 p-2 rounded-md"
                              >
                                <p className="text-white/70 capitalize">{}</p>
                                <div className="pl-2">
                                  {Object.entries(value).map(
                                    ([subKey, subVal]) => (
                                      <p
                                        key={subKey}
                                        className="text-xs text-white/90"
                                      >
                                        {camelCaseToTitleCase(subKey)}:{" "}
                                        {String(subVal)}
                                      </p>
                                    )
                                  )}
                                </div>
                              </div>
                            );
                          } else {
                            return (
                              <div
                                key={key}
                                className="bg-white/5 p-2 rounded-md text-center"
                              >
                                <p className="text-white/70 capitalize">
                                  {key}
                                </p>
                                <p className="text-white">{String(value)}</p>
                              </div>
                            );
                          }
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-white/70">
                  No credit accounts found
                </p>
              )}
            </section>
          </div>
        )}
      </div>
    </>
  );
}

export default App;
