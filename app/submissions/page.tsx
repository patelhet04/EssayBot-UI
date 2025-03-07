"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Loader2, Upload, Users, Download, MessageSquare } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

// API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface FileInfo {
  name: string;
  path: string;
  rowCount: number;
  hasResponseColumn: boolean;
  columns: string[];
}

interface PreviewRow {
  studentId: string;
  excerpt: string;
  wordCount: number;
}

interface Model {
  name: string;
  version: string;
  size: string;
}

export default function SubmissionsPage() {
  const [isUploading, setIsUploading] = useState(false);
  const [availableModels, setAvailableModels] = useState<Model[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [model, setModel] = useState<string>("");
  const [fileUploaded, setFileUploaded] = useState(false);
  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null);
  const [previewData, setPreviewData] = useState<PreviewRow[]>([]);
  const [jobId, setJobId] = useState<string | null>(null);
  const [statusCheckInterval, setStatusCheckInterval] =
    useState<NodeJS.Timeout | null>(null);
  const [processingStatus, setProcessingStatus] = useState({
    processed: 0,
    total: 0,
    isComplete: false,
    outputUrl: "",
  });

  const [showResults, setShowResults] = useState(false);
  const [resultData, setResultData] = useState<any[]>([]);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [feedbackTitle, setFeedbackTitle] = useState("");
  const [feedbackContent, setFeedbackContent] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Upload Excel file
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${API_BASE_URL}/api/upload-essays`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to upload file");
      }

      const data = await response.json();
      console.log(data, "DATATA");
      if (data.success) {
        setFileUploaded(true);
        setFileInfo({
          name: data.fileInfo.name,
          path: data.fileInfo.path,
          rowCount: data.fileInfo.rowCount || 0,
          hasResponseColumn: data.fileInfo.hasResponseColumn || false,
          columns: data.fileInfo.columns || [],
        });

        // Set preview data if available
        if (data.fileInfo.previewData) {
          setPreviewData(
            data.fileInfo.previewData.map((row: any) => ({
              studentId: row.student_id || "Unknown",
              excerpt: row.excerpt || "No content",
              wordCount: row.word_count || 0,
            }))
          );
        }

        toast({
          title: "File uploaded successfully",
          description: `${data.fileInfo.rowCount} submissions detected`,
        });
      } else {
        throw new Error(data.message || "Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/list-models`);
        const data = await response.json();

        if (
          data.success &&
          Array.isArray(data.models) &&
          data.models.length > 0
        ) {
          console.log("Fetched Models:", data.models); // ✅ Debug log

          // ✅ Ensure models are valid objects
          const filteredModels = data.models.filter((m) => m.name);
          setAvailableModels(filteredModels);

          // ✅ Set a default model correctly
          const defaultModel =
            filteredModels.find((m) => m.name === "llama3.1:latest") ||
            filteredModels[0];
          setModel(defaultModel?.name || "");
        }
      } catch (error) {
        console.error("Error fetching models:", error);
      }
    };

    fetchModels();
  }, []);

  // Start grading process
  const handleBulkGenerate = async () => {
    if (!fileInfo) return;

    setIsGenerating(true);

    try {
      console.log("Selected Model:", model); // ✅ Debug log

      const response = await fetch(`${API_BASE_URL}/api/grade-essays`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          filePath: fileInfo.path,
          model: model.toString(), // ✅ Ensure it's a string
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to start grading");
      }

      const data = await response.json();
      if (data.success) {
        setJobId(data.jobId);
        setProcessingStatus({
          processed: 0,
          total: fileInfo.rowCount,
          isComplete: false,
          outputUrl: "",
        });

        // ✅ Start polling for status updates
        const interval = setInterval(
          () => checkGradingStatus(data.jobId),
          2000
        );
        setStatusCheckInterval(interval);

        setFeedback(
          "Grading process started. This may take several minutes..."
        );
      } else {
        throw new Error(data.message || "Grading failed to start");
      }
    } catch (error) {
      console.error("Grading error:", error);
      setIsGenerating(false);
      toast({
        title: "Failed to start grading",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  // Download graded file
  const handleDownload = () => {
    if (processingStatus.outputUrl) {
      window.location.href = `${API_BASE_URL}${processingStatus.outputUrl}`;
    }
  };

  const showFeedback = (type: string, content: string) => {
    let title = "";
    switch (type) {
      case "identification":
        title = "Identification and Order";
        break;
      case "explanation":
        title = "Explanation of Steps";
        break;
      case "understanding":
        title = "Understanding Goals";
        break;
      case "clarity":
        title = "Clarity and Organization";
        break;
      default:
        title = "Feedback";
    }

    setFeedbackTitle(title);
    setFeedbackContent(content);
    setFeedbackModalOpen(true);
  };

  // Add this function to fetch result data
  const fetchResults = async (jobId: string) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/grading-results/${jobId}`
      );
      if (!response.ok) throw new Error("Failed to fetch results");

      const data = await response.json();
      if (data.success && data.results) {
        // Map to the table format
        const formattedResults = data.results.map((item: any) => ({
          studentId: item.student_id || "",
          identification: item.feedback_1_score || 0,
          identificationFeedback: item.feedback_1_feedback || "",
          explanation: item.feedback_2_score || 0,
          explanationFeedback: item.feedback_2_feedback || "",
          understanding: item.feedback_3_score || 0,
          understandingFeedback: item.feedback_3_feedback || "",
          clarity: item.feedback_4_score || 0,
          clarityFeedback: item.feedback_4_feedback || "",
          total: item.total_score || 0,
        }));

        setResultData(formattedResults);
        setShowResults(true);
      }
    } catch (error) {
      console.error("Error fetching results:", error);
      toast({
        title: "Error fetching results",
        description: "Could not load grading results",
        variant: "destructive",
      });
    }
  };

  // Update the checkGradingStatus function
  const checkGradingStatus = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/grading-status/${id}`);
      if (!response.ok) {
        console.error("Status check failed");
        return;
      }

      const data = await response.json();
      console.log("Grading Status Response:", data); // ✅ Debugging

      if (data.status === "processing") {
        setProcessingStatus((prevStatus) => ({
          ...prevStatus,
          processed: data.progress || prevStatus.processed,
          total: fileInfo?.rowCount || 0,
          isComplete: false,
        }));
      } else if (data.status === "complete") {
        // ✅ Ensure completion is detected
        if (statusCheckInterval) {
          clearInterval(statusCheckInterval);
          setStatusCheckInterval(null);
        }

        setProcessingStatus({
          processed: fileInfo?.rowCount || 0,
          total: fileInfo?.rowCount || 0,
          isComplete: true,
          outputUrl: data.outputUrl || "",
        });

        setIsGenerating(false);
        setFeedback(
          `🎉 Grading completed! ${fileInfo?.rowCount} submissions processed.`
        );

        fetchResults(id);

        toast({
          title: "Grading complete",
          description: "All submissions have been processed successfully.",
        });
      }
    } catch (error) {
      console.error("Status check error:", error);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Grading Mode Tabs */}
      <div className="border-b p-4">
        <div className="max-w-4xl mx-auto flex space-x-4">
          <Button variant="default" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Bulk Grading
          </Button>
        </div>
      </div>
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 p-8 overflow-y-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Bulk Grading
            </h1>
            <p className="text-gray-600">
              Upload a spreadsheet containing student submissions to generate
              feedback for multiple students at once.
            </p>
          </div>

          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                {!fileUploaded ? (
                  <>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 flex flex-col items-center justify-center">
                      {isUploading ? (
                        <div className="flex flex-col items-center">
                          <Loader2 className="h-12 w-12 text-blue-500 animate-spin mb-4" />
                          <p className="text-blue-600 font-medium">
                            Uploading file...
                          </p>
                        </div>
                      ) : (
                        <>
                          <Upload className="h-12 w-12 text-gray-400 mb-4" />
                          <p className="text-gray-600 mb-2">
                            Drag and drop your Excel file here, or click to
                            browse
                          </p>
                          <p className="text-xs text-gray-500 mb-4">
                            Supports .xlsx and .csv formats
                          </p>
                          <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept=".xlsx,.csv"
                            onChange={handleFileUpload}
                          />
                          <Button onClick={() => fileInputRef.current?.click()}>
                            Upload Spreadsheet
                          </Button>
                        </>
                      )}
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg text-sm">
                      <p className="font-medium text-blue-600 mb-2">
                        File Format Requirements:
                      </p>
                      <ul className="text-blue-700 list-disc pl-5 space-y-1">
                        <li>Each row should contain one student submission</li>
                        <li>
                          Required column: "response" (student answer text)
                        </li>
                        <li>Optional columns: student_id, name, score</li>
                      </ul>
                    </div>
                  </>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="bg-green-100 p-2 rounded-full mr-3">
                          <Upload className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-green-700">
                            {fileInfo?.name}
                          </p>
                          <p className="text-sm text-green-600">
                            {fileInfo?.rowCount} submissions detected
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setFileUploaded(false)}
                      >
                        Change File
                      </Button>
                    </div>

                    {isGenerating && !processingStatus.isComplete ? (
                      <div className="space-y-3">
                        <p className="font-medium">Processing submissions...</p>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full transition-all duration-700"
                            style={{
                              width: `${
                                processingStatus.total > 0
                                  ? Math.min(
                                      (processingStatus.processed /
                                        processingStatus.total) *
                                        100,
                                      100
                                    )
                                  : 0
                              }%`,
                            }}
                          ></div>
                        </div>
                        <p className="text-sm text-gray-600">
                          {processingStatus.processed} of{" "}
                          {processingStatus.total} submissions processed
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {processingStatus.isComplete ? (
                          <div className="p-4 bg-green-50 rounded-lg text-center">
                            <p className="text-green-700 font-medium">
                              🎉 Grading Completed! All {fileInfo?.rowCount}{" "}
                              submissions have been processed.
                            </p>
                          </div>
                        ) : null}

                        <div className="grid grid-cols-2 gap-4">
                          <Card>
                            <CardContent className="p-4">
                              <h3 className="font-medium mb-2">
                                Submission Overview
                              </h3>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span>Total Submissions:</span>
                                  <span className="font-medium">
                                    {fileInfo?.rowCount}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Required Column:</span>
                                  <span
                                    className={`font-medium ${
                                      fileInfo?.hasResponseColumn
                                        ? "text-green-600"
                                        : "text-red-600"
                                    }`}
                                  >
                                    {fileInfo?.hasResponseColumn
                                      ? "Found"
                                      : "Missing"}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Columns Detected:</span>
                                  <span className="font-medium">
                                    {fileInfo?.columns?.length}
                                  </span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="p-4">
                              <h3 className="font-medium mb-2">
                                AI Configuration
                              </h3>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span>Selected Model:</span>
                                  <span className="font-medium">
                                    {model || "Not selected"}
                                  </span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>

                        <div className="space-y-3">
                          <h3 className="font-medium">AI Feedback Settings</h3>
                          <div className="space-y-4">
                            <div>
                              <label className="text-sm font-medium text-gray-700">
                                AI Model
                              </label>
                              <Select value={model} onValueChange={setModel}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select model" />
                                </SelectTrigger>
                                <SelectContent>
                                  {availableModels.map((model) => (
                                    <SelectItem
                                      key={model.name}
                                      value={`${model.name}:${model.version}`}
                                    >
                                      {model.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <Button
                            className="w-full"
                            onClick={handleBulkGenerate}
                            disabled={
                              isGenerating || !fileInfo?.hasResponseColumn
                            }
                          >
                            {isGenerating ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Generating Feedback for {fileInfo?.rowCount}{" "}
                                Students...
                              </>
                            ) : (
                              "Generate Bulk Feedback"
                            )}
                          </Button>

                          {feedback && processingStatus.isComplete && (
                            <div className="space-y-4">
                              <div className="mt-4 p-4 bg-green-50 rounded-lg">
                                <p className="text-green-700 font-medium">
                                  {feedback}
                                </p>
                                <div className="mt-4 flex justify-between">
                                  <Button
                                    variant="outline"
                                    onClick={() => setShowResults(!showResults)}
                                  >
                                    {showResults
                                      ? "Hide Results"
                                      : "Show Results"}
                                  </Button>
                                  <Button
                                    onClick={handleDownload}
                                    disabled={!processingStatus.outputUrl}
                                  >
                                    <Download className="mr-2 h-4 w-4" />
                                    Download Feedback (.xlsx)
                                  </Button>
                                </div>
                              </div>

                              {showResults && (
                                <Card className="mt-6">
                                  <CardContent className="p-6">
                                    <h2 className="font-semibold text-lg mb-4">
                                      Grading Results (
                                      {Math.min(resultData.length, 5)} of{" "}
                                      {resultData.length} submissions)
                                    </h2>
                                    <div className="overflow-x-auto">
                                      <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                          <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                              Student
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                              ID & Order (30)
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                              Explanation (30)
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                              Goals (30)
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                              Clarity (10)
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                              Total
                                            </th>
                                          </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                          {resultData
                                            .slice(0, 5)
                                            .map((row, index) => (
                                              <tr key={index}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                  <div className="font-medium">
                                                    {row.studentId ||
                                                      `Student ${index + 1}`}
                                                  </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                  <span className="text-sm font-medium">
                                                    {row.identification}
                                                  </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                  <span className="text-sm font-medium">
                                                    {row.explanation}
                                                  </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                  <span className="text-sm font-medium">
                                                    {row.understanding}
                                                  </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                  <span className="text-sm font-medium">
                                                    {row.clarity}
                                                  </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                  <div className="text-sm font-bold">
                                                    {row.total}
                                                  </div>
                                                </td>
                                              </tr>
                                            ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  </CardContent>
                                </Card>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {fileUploaded && previewData.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <h2 className="font-semibold text-lg mb-4">
                  Preview ({Math.min(previewData.length, 3)} of{" "}
                  {fileInfo?.rowCount} submissions)
                </h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Student
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Submission Excerpt
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Word Count
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {previewData.slice(0, 3).map((row, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-medium">{row.studentId}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 max-w-md truncate">
                              {row.excerpt}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {row.wordCount}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                              Ready
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
