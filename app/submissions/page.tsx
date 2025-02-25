"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Loader2, RotateCcw, Brain, Sparkles } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Dummy student data
const studentData = {
  name: "Alice Johnson",
  id: "1234",
  personality: "Analytical Thinker",
  learningStyle: "Visual-Logical",
  strengths: ["Problem Solving", "Technical Analysis"],
  weaknesses: ["Verbose Explanations", "Time Management"],
  pastPerformance: [
    { assignment: "Midterm", score: 88 },
    { assignment: "Project 1", score: 92 },
    { assignment: "Quiz 3", score: 85 },
  ],
  commonMistakes: ["Time Complexity Analysis", "Edge Cases"],
  improvementAreas: ["Code Optimization", "Documentation"],
  response: `Recursion is a programming concept where a function calls itself to solve 
  a problem by breaking it down into smaller, similar sub-problems. It's like 
  a Russian nesting doll, where each doll contains a smaller version of itself 
  until you reach the smallest doll.
  
  A practical example of recursion is in file system traversal. When you need 
  to search through all folders and subfolders in a directory, recursion 
  provides an elegant solution. The function visits a folder, processes its 
  files, and then calls itself for each subfolder it finds.
  
  Here's a pseudocode example:
  \`\`\`
  function searchFolder(folder):
      for each file in folder:
          process(file)
      for each subfolder in folder:
          searchFolder(subfolder)
  \`\`\`
  
  This recursive approach naturally handles folders of any depth without 
  needing to know the structure beforehand. It's both elegant and efficient 
  for tree-like structures.`,
}

export default function SubmissionsPage() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [feedback, setFeedback] = useState("")
  const [model, setModel] = useState("gpt4")
  const [tone, setTone] = useState(50) // 0-100 scale for formal vs informal
  const [depth, setDepth] = useState(70) // 0-100 scale for brief vs detailed
  const [creativity, setCreativity] = useState(60) // 0-100 scale for conservative vs creative

  const handleGenerate = () => {
    setIsGenerating(true)
    setTimeout(() => {
      setIsGenerating(false)
      setFeedback(`Excellent explanation of recursion! Your analogy of Russian nesting dolls effectively illustrates the concept. 

Strong points:
- Clear explanation of the basic concept
- Practical example with file system traversal
- Well-structured pseudocode example

Areas for improvement:
- Could mention base case importance
- Consider discussing time/space complexity
- Add more real-world applications

Score: 90/100

Recommendations:
1. Review base case handling in recursive functions
2. Practice analyzing algorithmic complexity
3. Explore more practical applications in data structures

Keep up the great work! Your logical thinking is evident in your explanation.`)
    }, 2000)
  }

  return (
    <div className="flex h-screen">
      {/* Left Panel - Student Response */}
      <div className="flex-1 border-r p-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Student Submission</h1>
          <Select defaultValue="student1">
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="Select student" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="student1">Alice Johnson - ID: 1234</SelectItem>
              <SelectItem value="student2">Bob Smith - ID: 1235</SelectItem>
              <SelectItem value="student3">Carol White - ID: 1236</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="prose max-w-none">
              <h2 className="text-xl font-semibold">Question:</h2>
              <p className="text-gray-600">
                Explain the concept of recursion in programming and provide an example of its practical application in
                solving real-world problems.
              </p>

              <h2 className="mt-6 text-xl font-semibold">Student's Response:</h2>
              <div className="max-h-[calc(100vh-400px)] overflow-y-auto rounded-lg bg-gray-50 p-4">
                <pre className="whitespace-pre-wrap text-gray-600">{studentData.response}</pre>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Panel - AI Playground & Student Analytics */}
      <div className="w-[400px] space-y-6 p-6">
        {/* Student Analytics */}
        <Card>
          <CardContent className="p-4">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold">Student Profile</h3>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Brain className="h-5 w-5 text-blue-500" />
                  </TooltipTrigger>
                  <TooltipContent>AI-generated learning profile based on past submissions</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <div className="space-y-4 text-sm">
              <div>
                <span className="font-medium">Learning Style:</span>
                <span className="ml-2 text-gray-600">{studentData.learningStyle}</span>
              </div>

              <div>
                <span className="font-medium">Strengths:</span>
                <div className="mt-1 flex flex-wrap gap-2">
                  {studentData.strengths.map((strength) => (
                    <span key={strength} className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-700">
                      {strength}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="font-medium">Areas for Improvement:</span>
                <div className="mt-1 flex flex-wrap gap-2">
                  {studentData.improvementAreas.map((area) => (
                    <span key={area} className="rounded-full bg-yellow-100 px-2 py-1 text-xs text-yellow-700">
                      {area}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="font-medium">Learning Curve</span>
                <div className="mt-2 space-y-2">
                  {studentData.pastPerformance.map((perf) => (
                    <div key={perf.assignment} className="flex items-center justify-between">
                      <span>{perf.assignment}</span>
                      <span className="font-medium">{perf.score}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Playground Controls */}
        <div className="space-y-4">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <Sparkles className="h-5 w-5 text-blue-500" />
            AI Playground
          </h2>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">AI Model</label>
              <Select value={model} onValueChange={setModel}>
                <SelectTrigger>
                  <SelectValue placeholder="Select model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt4">GPT-4 (Most Capable)</SelectItem>
                  <SelectItem value="gpt35">GPT-3.5 (Faster)</SelectItem>
                  <SelectItem value="claude">Claude 2 (Detailed)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Tone Balance: {tone < 30 ? "Formal" : tone > 70 ? "Casual" : "Balanced"}
              </label>
              <Slider value={[tone]} onValueChange={(value) => setTone(value[0])} max={100} step={1} className="py-4" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Feedback Depth: {depth < 30 ? "Brief" : depth > 70 ? "Detailed" : "Balanced"}
              </label>
              <Slider
                value={[depth]}
                onValueChange={(value) => setDepth(value[0])}
                max={100}
                step={1}
                className="py-4"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Style: {creativity < 30 ? "Conservative" : creativity > 70 ? "Creative" : "Balanced"}
              </label>
              <Slider
                value={[creativity]}
                onValueChange={(value) => setCreativity(value[0])}
                max={100}
                step={1}
                className="py-4"
              />
            </div>

            <Button className="w-full" onClick={handleGenerate} disabled={isGenerating}>
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate Feedback"
              )}
            </Button>
          </div>
        </div>

        {/* Generated Feedback */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Generated Feedback</h2>
            <Button variant="ghost" size="sm" onClick={handleGenerate}>
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
          <Textarea
            className="min-h-[200px]"
            placeholder="Generated feedback will appear here..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
          />
        </div>

        {/* Navigation */}
        <div className="flex space-x-3">
          <Button variant="outline" className="flex-1">
            Previous
          </Button>
          <Button className="flex-1">Approve & Next</Button>
        </div>
      </div>
    </div>
  )
}

