"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Plus,
  Trash2,
  Upload,
  Edit,
  Save,
  FileText,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/components/ui/use-toast";

// API base URL - update this based on your environment
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// Define types for TypeScript
interface ScoringLevels {
  full: string;
  partial: string;
  minimal: string;
}

interface Criteria {
  name: string;
  description: string;
  weight: number;
  subCriteria: string[];
  scoringLevels?: ScoringLevels;
}

interface Rubric {
  mainCriteria: Criteria[];
}

// Initial empty rubric
const emptyRubric: Rubric = {
  mainCriteria: [],
};

export default function RubricPage() {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const [showRubric, setShowRubric] = useState(false);
  const [rubric, setRubric] = useState<Rubric>(emptyRubric);
  const [isEditing, setIsEditing] = useState(false);
  const [editingCell, setEditingCell] = useState({ row: -1, col: -1 });
  const [activeTab, setActiveTab] = useState("upload");
  const [rubricId, setRubricId] = useState<string | null>(null);
  const [finalizing, setFinalizing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection for upload
  const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadRubricFile(file);
    }
  };

  const handleScoringLevelEdit = (
    rowIndex: number,
    level: keyof ScoringLevels,
    value: string
  ) => {
    const newRubric = { ...rubric };

    if (!newRubric.mainCriteria[rowIndex].scoringLevels) {
      newRubric.mainCriteria[rowIndex].scoringLevels = {
        full: "",
        partial: "",
        minimal: "",
      };
    }

    // Now we know scoringLevels exists
    if (newRubric.mainCriteria[rowIndex].scoringLevels) {
      newRubric.mainCriteria[rowIndex].scoringLevels[level] = value;
    }

    setRubric(newRubric);
  };

  // Upload the rubric file to the server
  const uploadRubricFile = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);
    setStatusMessage("Uploading rubric file...");

    // Create form data
    const formData = new FormData();
    formData.append("file", file);
    formData.append("name", file.name.replace(/\.[^/.]+$/, ""));

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
      const response = await fetch(`${API_BASE_URL}/api/upload-rubric`, {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error uploading rubric file");
      }

      setUploadProgress(100);
      const data = await response.json();
      console.log(data, "DATA");
      // Process the table data from the response
      if (data.rubric && data.rubric.criteria) {
        // Convert the API format to our app format
        const formattedRubric: Rubric = {
          mainCriteria: data.rubric.criteria.map((criterion: any) => ({
            name: criterion.name,
            description: criterion.description || "",
            weight: criterion.weight,
            subCriteria: criterion.subCriteria || [],
            scoringLevels: criterion.scoringLevels || {
              full: "",
              partial: "",
              minimal: "",
            },
          })),
        };

        setRubric(formattedRubric);
        setRubricId(data.id);
        setShowRubric(true);
      }

      // Handle success
      setStatusMessage(data.message || "Rubric processed successfully");
      setUploadStatus("success");

      toast({
        title: "Upload Successful",
        description:
          "Rubric has been processed and is ready for customization.",
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

  // Handle cell editing in the table
  const handleCellEdit = (
    rowIndex: number,
    colIndex: number,
    value: string
  ) => {
    const newRubric = { ...rubric };

    // Handle different column types
    if (colIndex === 0) {
      newRubric.mainCriteria[rowIndex].name = value;
    } else if (colIndex === 1) {
      newRubric.mainCriteria[rowIndex].description = value;
    } else if (colIndex === 2) {
      newRubric.mainCriteria[rowIndex].weight = parseInt(value) || 0;
    }

    setRubric(newRubric);
  };

  // Remove a criteria from the rubric
  const removeCriteria = (index: number) => {
    const newRubric = { ...rubric };
    newRubric.mainCriteria.splice(index, 1);
    setRubric(newRubric);
  };

  // Finalize the rubric and save it to the server
  // Finalize the rubric and save it to the server
  const finalizeRubric = async () => {
    if (!rubricId) {
      toast({
        title: "Error",
        description: "No rubric ID found. Please upload a rubric file first.",
        variant: "destructive",
      });
      return;
    }

    setFinalizing(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/save-rubric`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rubricId,
          criteria: rubric.mainCriteria,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error saving rubric");
      }

      const data = await response.json();

      // Show success toast
      toast({
        title: "Rubric Saved",
        description: "Your rubric has been saved and will be used for grading.",
        duration: 3000, // 3 seconds
      });

      // Wait a moment to let the user see the toast
      setTimeout(() => {
        // Navigate to the next page
        router.push("/submissions");
      }, 1000);
    } catch (error) {
      console.error("Error finalizing rubric:", error);

      toast({
        title: "Save Failed",
        description:
          error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setFinalizing(false);
    }
  };

  return (
    <div className="space-y-8 p-8">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold text-gray-900"
      >
        Rubric Creation
      </motion.h1>

      {!showRubric && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Card>
            <CardHeader>
              <CardTitle>Upload Rubric Document</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 p-10 rounded-md">
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept=".doc,.docx,.pdf"
                  onChange={handleFileSelection}
                />

                {isUploading ? (
                  <div className="w-full max-w-md space-y-4 px-8">
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center text-sm font-medium text-blue-600"
                    >
                      {statusMessage}
                    </motion.div>
                    <Progress value={uploadProgress} className="h-2 w-full" />
                  </div>
                ) : uploadStatus === "success" ? (
                  <div className="flex flex-col items-center space-y-2 text-center">
                    <CheckCircle className="h-12 w-12 text-green-500" />
                    <p className="text-green-600 font-medium">
                      {statusMessage}
                    </p>
                    <p className="text-sm text-gray-500">
                      Processing rubric structure...
                    </p>
                  </div>
                ) : uploadStatus === "error" ? (
                  <div className="flex flex-col items-center space-y-2 text-center">
                    <AlertCircle className="h-12 w-12 text-red-500" />
                    <p className="text-red-600 font-medium">Upload Failed</p>
                    <p className="text-sm text-gray-500">{statusMessage}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setUploadStatus("idle")}
                    >
                      Try Again
                    </Button>
                  </div>
                ) : (
                  <>
                    <FileText className="h-16 w-16 text-gray-400 mb-4" />
                    <p className="text-sm text-gray-500 mb-4">
                      Upload a DOC or PDF file containing your rubric
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Select File
                    </Button>
                  </>
                )}
              </div>

              <Alert className="bg-blue-50">
                <FileText className="h-4 w-4" />
                <AlertTitle>Rubric Processing</AlertTitle>
                <AlertDescription>
                  Upload a document with your grading rubric. The system will
                  extract the criteria, weights, and scoring ranges to create a
                  customizable rubric table.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {showRubric && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex justify-between">
            <h2 className="text-2xl font-semibold text-gray-900">
              Rubric Table
            </h2>
            <div className="space-x-4">
              <Button
                variant="outline"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? "Preview Mode" : "Edit Rubric"}
              </Button>
              <Button variant="outline" onClick={() => setShowRubric(false)}>
                Upload New Rubric
              </Button>
            </div>
          </div>

          <Card>
            <CardContent className="pt-6">
              <Table className="border-collapse border border-gray-200">
                <TableHeader>
                  <TableRow>
                    <TableHead className="border border-gray-200 font-bold w-48">
                      Domain
                    </TableHead>
                    <TableHead className="border border-gray-200 font-bold w-64">
                      Description
                    </TableHead>
                    <TableHead className="border border-gray-200 font-bold w-20">
                      Points
                    </TableHead>
                    <TableHead className="border border-gray-200 font-bold">
                      Full Points
                      <br />
                      (30-25)
                    </TableHead>
                    <TableHead className="border border-gray-200 font-bold">
                      Partial Points
                      <br />
                      (25-15)
                    </TableHead>
                    <TableHead className="border border-gray-200 font-bold">
                      Minimal Points
                      <br />
                      (15+)
                    </TableHead>
                    <TableHead className="border border-gray-200 font-bold w-16">
                      Total
                    </TableHead>
                    {isEditing && (
                      <TableHead className="border border-gray-200 font-bold">
                        Actions
                      </TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rubric.mainCriteria.map((criteria, rowIndex) => (
                    <TableRow key={rowIndex}>
                      <TableCell className="border border-gray-200">
                        {isEditing &&
                        editingCell.row === rowIndex &&
                        editingCell.col === 0 ? (
                          <Input
                            value={criteria.name}
                            onChange={(e) =>
                              handleCellEdit(rowIndex, 0, e.target.value)
                            }
                            onBlur={() => setEditingCell({ row: -1, col: -1 })}
                            autoFocus
                          />
                        ) : (
                          <div
                            className={
                              isEditing
                                ? "cursor-pointer hover:bg-gray-100 p-1"
                                : "p-1"
                            }
                            onClick={() =>
                              isEditing &&
                              setEditingCell({ row: rowIndex, col: 0 })
                            }
                          >
                            {/* Remove any numeric prefix in display */}
                            {criteria.name.replace(/^\d+\)\s*/, "")}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="border border-gray-200">
                        {isEditing &&
                        editingCell.row === rowIndex &&
                        editingCell.col === 1 ? (
                          <Input
                            value={criteria.description}
                            onChange={(e) =>
                              handleCellEdit(rowIndex, 1, e.target.value)
                            }
                            onBlur={() => setEditingCell({ row: -1, col: -1 })}
                            autoFocus
                          />
                        ) : (
                          <div
                            className={
                              isEditing
                                ? "cursor-pointer hover:bg-gray-100 p-1"
                                : "p-1"
                            }
                            onClick={() =>
                              isEditing &&
                              setEditingCell({ row: rowIndex, col: 1 })
                            }
                          >
                            {criteria.description || "-"}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="border border-gray-200">
                        {isEditing &&
                        editingCell.row === rowIndex &&
                        editingCell.col === 2 ? (
                          <Input
                            value={criteria.weight.toString()}
                            type="number"
                            min="0"
                            max="100"
                            onChange={(e) =>
                              handleCellEdit(rowIndex, 2, e.target.value)
                            }
                            onBlur={() => setEditingCell({ row: -1, col: -1 })}
                            autoFocus
                          />
                        ) : (
                          <div
                            className={
                              isEditing
                                ? "cursor-pointer hover:bg-gray-100 p-1 text-center"
                                : "p-1 text-center"
                            }
                            onClick={() =>
                              isEditing &&
                              setEditingCell({ row: rowIndex, col: 2 })
                            }
                          >
                            {criteria.weight}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="border border-gray-200 text-sm">
                        {criteria.scoringLevels?.full || "-"}
                      </TableCell>
                      <TableCell className="border border-gray-200 text-sm">
                        {criteria.scoringLevels?.partial || "-"}
                      </TableCell>
                      <TableCell className="border border-gray-200 text-sm">
                        {criteria.scoringLevels?.minimal || "-"}
                      </TableCell>
                      <TableCell className="border border-gray-200 text-center font-medium">
                        {criteria.weight}
                      </TableCell>
                      {isEditing && (
                        <TableCell className="border border-gray-200">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeCriteria(rowIndex)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                  {/* Total row */}
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="border border-gray-200 text-right font-bold"
                    >
                      Total:
                    </TableCell>
                    <TableCell className="border border-gray-200 text-center font-bold">
                      {rubric.mainCriteria.reduce(
                        (sum, criteria) => sum + criteria.weight,
                        0
                      )}
                    </TableCell>
                    {isEditing && (
                      <TableCell className="border border-gray-200"></TableCell>
                    )}
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-4">
            <Button
              size="lg"
              disabled={finalizing || rubric.mainCriteria.length === 0}
              onClick={finalizeRubric}
            >
              {finalizing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Finalize Rubric"
              )}
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
