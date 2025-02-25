"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Upload, Edit } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useRouter } from "next/navigation"

// Dummy data for knowledge graph
const knowledgeGraph = {
  nodes: [
    { id: 1, label: "Data Structures", x: 100, y: 100 },
    { id: 2, label: "Arrays", x: 200, y: 50 },
    { id: 3, label: "Linked Lists", x: 200, y: 150 },
    { id: 4, label: "Time Complexity", x: 300, y: 100 },
  ],
  edges: [
    { from: 1, to: 2 },
    { from: 1, to: 3 },
    { from: 2, to: 4 },
    { from: 3, to: 4 },
  ],
}

export default function UploadPage() {
  const [isUploading, setIsUploading] = useState(false)
  const router = useRouter()

  const handleUpload = () => {
    setIsUploading(true)
    setTimeout(() => setIsUploading(false), 2000)
  }

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
          <TabsTrigger value="paste">Copy & Paste</TabsTrigger>
        </TabsList>

        <TabsContent value="upload">
          <Card>
            <CardHeader>
              <CardTitle>Upload Assignment</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                onClick={handleUpload}
                className="flex h-60 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100"
              >
                {isUploading ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="h-12 w-12 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"
                  />
                ) : (
                  <>
                    <Upload className="mb-4 h-12 w-12 text-gray-400" />
                    <p className="text-center text-gray-600">Drag and drop your files here, or click to select files</p>
                    <p className="mt-2 text-sm text-gray-500">Supported formats: PDF, DOCX, TXT</p>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="paste">
          <Card>
            <CardHeader>
              <CardTitle>Paste Question Text</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea placeholder="Paste your question text here..." className="min-h-[200px]" />
            </CardContent>
          </Card>
        </TabsContent>
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
                const from = knowledgeGraph.nodes.find((n) => n.id === edge.from)
                const to = knowledgeGraph.nodes.find((n) => n.id === edge.to)
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
                )
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
                  <text x={node.x} y={node.y + 40} textAnchor="middle" className="text-sm font-medium">
                    {node.label}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button size="lg" className="text-lg" onClick={() => router.push("/rubric")}>
          Next: Generate Rubric
        </Button>
      </div>
    </div>
  )
}

