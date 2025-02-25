"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Loader2, Plus, Trash2 } from "lucide-react"

// Initial dummy rubric data
const initialRubric = {
  mainCriteria: [
    {
      name: "Understanding of Core Concepts",
      description: "Demonstrates comprehension of fundamental principles and theories",
      weight: 35,
      subCriteria: ["Accurate use of terminology", "Clear explanation of concepts", "Application of theories"],
    },
    {
      name: "Critical Analysis",
      description: "Shows depth of analysis and evaluation of the topic",
      weight: 40,
      subCriteria: ["Logical reasoning", "Supporting evidence", "Counter-arguments consideration"],
    },
    {
      name: "Communication",
      description: "Clarity and effectiveness of presentation",
      weight: 25,
      subCriteria: ["Organization of ideas", "Writing clarity", "Academic style"],
    },
  ],
}

export default function RubricPage() {
  const [question, setQuestion] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [showRubric, setShowRubric] = useState(false)
  const [rubric, setRubric] = useState(initialRubric)
  const [isEditing, setIsEditing] = useState(false)

  const handleGenerate = () => {
    setIsGenerating(true)
    setTimeout(() => {
      setIsGenerating(false)
      setShowRubric(true)
    }, 2000)
  }

  const updateCriteria = (index: number, field: string, value: any) => {
    const newRubric = { ...rubric }
    newRubric.mainCriteria[index][field] = value
    setRubric(newRubric)
  }

  const updateSubCriteria = (criteriaIndex: number, subIndex: number, value: string) => {
    const newRubric = { ...rubric }
    newRubric.mainCriteria[criteriaIndex].subCriteria[subIndex] = value
    setRubric(newRubric)
  }

  const addSubCriteria = (criteriaIndex: number) => {
    const newRubric = { ...rubric }
    newRubric.mainCriteria[criteriaIndex].subCriteria.push("New sub-criteria")
    setRubric(newRubric)
  }

  const removeSubCriteria = (criteriaIndex: number, subIndex: number) => {
    const newRubric = { ...rubric }
    newRubric.mainCriteria[criteriaIndex].subCriteria.splice(subIndex, 1)
    setRubric(newRubric)
  }

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
              <CardTitle>Enter Question</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Paste your question text here..."
                className="min-h-[200px]"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
              />
              <Button
                size="lg"
                className="w-full text-lg"
                onClick={handleGenerate}
                disabled={isGenerating || !question}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Rubric...
                  </>
                ) : (
                  "Generate Rubric"
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {showRubric && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="flex justify-between">
            <h2 className="text-2xl font-semibold text-gray-900">Generated Rubric</h2>
            <div className="space-x-4">
              <Button variant="outline" onClick={() => setIsEditing(!isEditing)}>
                {isEditing ? "Preview Mode" : "Edit Rubric"}
              </Button>
              <Button variant="outline" onClick={() => setShowRubric(false)}>
                Generate New Rubric
              </Button>
            </div>
          </div>

          {rubric.mainCriteria.map((criteria, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {isEditing ? (
                    <Input
                      value={criteria.name}
                      onChange={(e) => updateCriteria(index, "name", e.target.value)}
                      className="max-w-md"
                    />
                  ) : (
                    <span>{criteria.name}</span>
                  )}
                  <span className="text-sm text-gray-500">Weight: {criteria.weight}%</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing ? (
                  <Textarea
                    value={criteria.description}
                    onChange={(e) => updateCriteria(index, "description", e.target.value)}
                    className="h-20"
                  />
                ) : (
                  <p className="text-gray-600">{criteria.description}</p>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Adjust Weight</label>
                  <Slider
                    value={[criteria.weight]}
                    onValueChange={(value) => updateCriteria(index, "weight", value[0])}
                    max={100}
                    step={5}
                    className="py-4"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Sub-criteria:</h4>
                    {isEditing && (
                      <Button variant="outline" size="sm" onClick={() => addSubCriteria(index)}>
                        <Plus className="mr-1 h-4 w-4" />
                        Add Sub-criteria
                      </Button>
                    )}
                  </div>
                  <ul className="space-y-2">
                    {criteria.subCriteria.map((sub, subIndex) => (
                      <li key={subIndex} className="flex items-center gap-2">
                        {isEditing ? (
                          <>
                            <Input value={sub} onChange={(e) => updateSubCriteria(index, subIndex, e.target.value)} />
                            <Button variant="ghost" size="sm" onClick={() => removeSubCriteria(index, subIndex)}>
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </>
                        ) : (
                          <span className="text-gray-600">{sub}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ))}

          <div className="flex justify-end space-x-4">
            <Button size="lg">Finalize Rubric</Button>
          </div>
        </motion.div>
      )}
    </div>
  )
}

