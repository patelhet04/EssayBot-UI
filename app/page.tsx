"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const performanceData = [
  { week: "Week 1", score: 75 },
  { week: "Week 2", score: 78 },
  { week: "Week 3", score: 82 },
  { week: "Week 4", score: 80 },
  { week: "Week 5", score: 85 },
  { week: "Week 6", score: 88 },
]

export default function Dashboard() {
  const router = useRouter()

  return (
    <div className="space-y-8 p-8">
      {/* Header with Class Selection */}
      <div className="flex items-center justify-between">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-gray-900"
        >
          Welcome, Professor Anderson
        </motion.h1>
        <Select>
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

      {/* Task Overview */}
      <div className="grid gap-6 md:grid-cols-2">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Grading Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {[
                  { title: "Midterm Essays", due: "Due Today", count: 20, urgent: true },
                  { title: "Programming Assignment 3", due: "Due Tomorrow", count: 15 },
                  { title: "Quiz 2 Responses", due: "Due in 3 days", count: 25 },
                ].map((task) => (
                  <li
                    key={task.title}
                    className={`flex items-center justify-between rounded-lg border p-4 ${
                      task.urgent ? "border-red-200 bg-red-50" : ""
                    }`}
                  >
                    <div>
                      <h3 className="font-medium">{task.title}</h3>
                      <p className={`text-sm ${task.urgent ? "text-red-600" : "text-gray-500"}`}>{task.due}</p>
                    </div>
                    <span className="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-600">
                      {task.count} submissions
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardHeader>
              <CardTitle>Completed Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                {[
                  { title: "Week 3 Assignments", count: 30, date: "Completed today" },
                  { title: "Lab Report 2", count: 28, date: "Completed yesterday" },
                  { title: "Quiz 1 Responses", count: 25, date: "Completed 2 days ago" },
                ].map((task) => (
                  <li key={task.title} className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <h3 className="font-medium">{task.title}</h3>
                      <p className="text-sm text-gray-500">{task.date}</p>
                    </div>
                    <span className="rounded-full bg-green-100 px-3 py-1 text-sm text-green-600">
                      ✓ {task.count} graded
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Performance Overview */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <Card>
          <CardHeader>
            <CardTitle>Class Performance Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="score" stroke="#2563eb" strokeWidth={2} dot={{ fill: "#2563eb" }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex gap-4"
      >
        <Button size="lg" className="text-lg" onClick={() => router.push("/upload")}>
          Grade New Submissions
        </Button>
        <Button size="lg" variant="outline" className="text-lg" onClick={() => router.push("/reports")}>
          View Reports
        </Button>
      </motion.div>
    </div>
  )
}

