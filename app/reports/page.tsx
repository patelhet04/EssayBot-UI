"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"

const performanceData = [
  { week: "Week 1", average: 75 },
  { week: "Week 2", average: 78 },
  { week: "Week 3", average: 82 },
  { week: "Week 4", average: 80 },
  { week: "Week 5", average: 85 },
  { week: "Week 6", average: 88 },
]

const mistakesData = [
  { name: "Logic Errors", count: 45 },
  { name: "Syntax Issues", count: 30 },
  { name: "Time Complexity", count: 25 },
  { name: "Documentation", count: 20 },
  { name: "Edge Cases", count: 15 },
]

const gradeDistribution = [
  { name: "A (90-100)", value: 25 },
  { name: "B (80-89)", value: 35 },
  { name: "C (70-79)", value: 20 },
  { name: "D (60-69)", value: 15 },
  { name: "F (<60)", value: 5 },
]

const COLORS = ["#4ade80", "#60a5fa", "#facc15", "#f87171", "#f43f5e"]

export default function ReportsPage() {
  return (
    <div className="space-y-8 p-8">
      <div className="flex items-center justify-between">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-gray-900"
        >
          Class Performance Analytics
        </motion.h1>
        <Select defaultValue="cs101">
          <SelectTrigger className="w-[300px]">
            <SelectValue placeholder="Select course" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="cs101">CS101: Introduction to Programming (Fall 2024)</SelectItem>
            <SelectItem value="cs201">CS201: Data Structures (Fall 2024)</SelectItem>
            <SelectItem value="cs301">CS301: Algorithms (Spring 2024)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Class Performance Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="average" stroke="#2563eb" strokeWidth={2} dot={{ fill: "#2563eb" }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Common Mistakes Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mistakesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Grade Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={gradeDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {gradeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Students Needing Support</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "Alice Johnson", score: 58, issue: "Consistent low performance" },
                { name: "Bob Smith", score: 62, issue: "Missing assignments" },
                { name: "Carol White", score: 65, issue: "Difficulty with algorithms" },
              ].map((student) => (
                <div key={student.name} className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <h3 className="font-medium">{student.name}</h3>
                    <p className="text-sm text-red-500">{student.issue}</p>
                  </div>
                  <span className="text-lg font-medium">{student.score}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end space-x-4">
        <Button variant="outline" size="lg">
          Download Excel Report
        </Button>
        <Button size="lg">Publish to Canvas</Button>
      </div>
    </div>
  )
}

