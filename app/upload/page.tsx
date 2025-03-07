"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/components/ui/use-toast";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Upload, FileText, CheckCircle, AlertCircle, Edit } from "lucide-react";

// API base URL - update this based on your environment
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// Example knowledge graph data (static for now)
const knowledgeGraph = {
  nodes: [
    { id: "1", label: "Segmentation", x: 100, y: 100 },
    { id: "2", label: "Targeting", x: 200, y: 200 },
    { id: "3", label: "Positioning", x: 300, y: 100 },
    { id: "4", label: "Marketing Mix", x: 400, y: 200 },
    { id: "5", label: "Strategy", x: 200, y: 300 },
  ],
  edges: [
    { from: "1", to: "2" },
    { from: "2", to: "3" },
    { from: "3", to: "4" },
    { from: "2", to: "5" },
    { from: "5", to: "4" },
  ],
};

export default function UploadPage() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const [processingDetails, setProcessingDetails] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Handle file selection
  const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadFile(file);
    }
  };

  // Handle clicking the upload area
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // Handle file upload
  const uploadFile = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);
    setStatusMessage("Preparing to upload...");

    // Create form data
    const formData = new FormData();
    formData.append("file", file);

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          const newProgress = prev + Math.floor(Math.random() * 10);
          if (newProgress >= 90) {
            clearInterval(progressInterval);
            return 90; // Hold at 90% until actual completion
          }
          return newProgress;
        });
      }, 300);

      // Upload the file
      const response = await fetch(
        `${API_BASE_URL}/api/upload-course-material`,
        {
          method: "POST",
          body: formData,
        }
      );

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error uploading file");
      }

      setUploadProgress(100);
      const data = await response.json();

      // Store processing details if available
      if (data.processing) {
        setProcessingDetails(data.processing);
      }

      // Handle success
      setStatusMessage(
        data.message || "Course material processed successfully"
      );
      setUploadStatus("success");

      toast({
        title: "Upload Successful",
        description:
          "Course material has been processed and added to the knowledge base.",
      });
    } catch (error) {
      console.error("Upload error:", error);
      setUploadStatus("error");
      setStatusMessage(
        error instanceof Error ? error.message : "Unknown error occurred"
      );

      toast({
        title: "Upload Failed",
        description:
          error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-8 p-8">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold text-gray-900"
      >
        Upload & Knowledge Base
      </motion.h1>

      <Tabs defaultValue="upload" className="space-y-6">
        <TabsList className="grid w-[400px] grid-cols-2">
          <TabsTrigger value="upload">Upload File</TabsTrigger>
          {/* <TabsTrigger value="paste">Copy & Paste</TabsTrigger> */}
        </TabsList>

        <TabsContent value="upload">
          <Card>
            <CardHeader>
              <CardTitle>Upload Course Material</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".pdf,.docx,.txt"
                onChange={handleFileSelection}
              />

              <div
                onClick={handleUploadClick}
                className={`flex h-60 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed 
                  ${
                    isUploading
                      ? "border-blue-400 bg-blue-50"
                      : "border-gray-300 bg-gray-50 hover:bg-gray-100"
                  }`}
              >
                {isUploading ? (
                  <div className="w-full max-w-md space-y-4 px-8">
                    <div className="text-center text-sm font-medium text-blue-600">
                      {statusMessage}
                    </div>
                    <Progress value={uploadProgress} className="h-2 w-full" />
                  </div>
                ) : uploadStatus === "success" ? (
                  <div className="flex flex-col items-center space-y-2 text-center">
                    <CheckCircle className="h-12 w-12 text-green-500" />
                    <p className="text-green-600 font-medium">
                      {statusMessage}
                    </p>
                    {processingDetails && (
                      <div className="mt-2 text-left w-full max-w-md">
                        <h3 className="text-sm font-medium text-gray-700 mb-1">
                          Processing Complete:
                        </h3>
                        <ul className="text-xs text-gray-600 space-y-1">
                          {processingDetails.steps_completed?.map(
                            (step: string, index: number) => (
                              <li key={index} className="flex items-center">
                                <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                                {step.replace(/_/g, " ")}
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        setUploadStatus("idle");
                      }}
                    >
                      Upload Another File
                    </Button>
                  </div>
                ) : uploadStatus === "error" ? (
                  <div className="flex flex-col items-center space-y-2 text-center">
                    <AlertCircle className="h-12 w-12 text-red-500" />
                    <p className="text-red-600 font-medium">Upload Failed</p>
                    <p className="text-sm text-gray-500">{statusMessage}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setUploadStatus("idle");
                      }}
                    >
                      Try Again
                    </Button>
                  </div>
                ) : (
                  <>
                    <Upload className="mb-4 h-12 w-12 text-gray-400" />
                    <p className="text-center text-gray-600">
                      Drag and drop your files here, or click to select files
                    </p>
                    <p className="mt-2 text-sm text-gray-500">
                      Supported formats: PDF, DOCX, TXT
                    </p>
                  </>
                )}
              </div>

              <Alert className="bg-blue-50">
                <FileText className="h-4 w-4" />
                <AlertTitle>Course Material Processing</AlertTitle>
                <AlertDescription>
                  Uploaded files will be processed by our RAG pipeline to
                  extract knowledge for automatic grading. This may take a few
                  moments to complete.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        {/* <TabsContent value="paste">
          <Card>
            <CardHeader>
              <CardTitle>Paste Question Text</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex h-60 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50">
                <p className="text-center text-gray-500">
                  Copy & Paste functionality will be implemented in a future
                  update.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent> */}
      </Tabs>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Knowledge Graph</CardTitle>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Edit className="mr-2 h-4 w-4" />
                Edit Knowledge Graph
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Edit Knowledge Graph</DialogTitle>
              </DialogHeader>
              <div className="h-[600px] w-full rounded-lg bg-gray-50 p-4">
                {/* This would be replaced with an actual graph visualization library */}
                <div className="flex h-full items-center justify-center text-gray-500">
                  Interactive Knowledge Graph Editor
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] rounded-lg bg-gray-50 p-4">
            {/* This would be replaced with an actual graph visualization */}
            <svg className="h-full w-full">
              {knowledgeGraph.edges.map((edge) => {
                const from = knowledgeGraph.nodes.find(
                  (n) => n.id === edge.from
                );
                const to = knowledgeGraph.nodes.find((n) => n.id === edge.to);
                return (
                  <line
                    key={`${edge.from}-${edge.to}`}
                    x1={from?.x}
                    y1={from?.y}
                    x2={to?.x}
                    y2={to?.y}
                    stroke="#94a3b8"
                    strokeWidth="2"
                  />
                );
              })}
              {knowledgeGraph.nodes.map((node) => (
                <g key={node.id}>
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r="20"
                    fill="#2563eb"
                    className="cursor-pointer transition-colors hover:fill-blue-700"
                  />
                  <text
                    x={node.x}
                    y={node.y + 40}
                    textAnchor="middle"
                    className="text-sm font-medium"
                  >
                    {node.label}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          size="lg"
          className="text-lg"
          onClick={() => router.push("/rubric")}
          disabled={uploadStatus !== "success"}
        >
          Next: Generate Rubric
        </Button>
      </div>
    </div>
  );
}
