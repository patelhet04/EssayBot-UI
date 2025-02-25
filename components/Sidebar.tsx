"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { Home, FolderOpen, CheckSquare, GraduationCap, BarChart2 } from "lucide-react"

const steps = [
  { name: "Dashboard", icon: Home, href: "/" },
  { name: "Upload & Knowledge Base", icon: FolderOpen, href: "/upload" },
  { name: "Rubric Creation", icon: CheckSquare, href: "/rubric" },
  { name: "Student Submissions & Feedback", icon: GraduationCap, href: "/submissions" },
  { name: "Reports & Performance", icon: BarChart2, href: "/reports" },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <nav className="w-72 bg-white shadow-lg p-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8">
        <h1 className="text-2xl font-bold text-blue-600">AI Grading Assistant</h1>
      </motion.div>

      <div className="relative">
        {/* Vertical connector line */}
        <div className="absolute left-6 top-8 h-[calc(100%-4rem)] w-0.5 bg-blue-100" />

        <ul className="relative space-y-6">
          {steps.map((step, index) => {
            const isActive = pathname === step.href
            return (
              <motion.li
                key={step.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  href={step.href}
                  className={`group flex items-center gap-4 ${
                    isActive ? "text-blue-600" : "text-gray-600 hover:text-blue-500"
                  }`}
                >
                  {/* Step indicator circle */}
                  <div
                    className={`relative z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 transition-colors
                      ${
                        isActive
                          ? "border-blue-600 bg-blue-600 text-white"
                          : "border-blue-200 bg-white text-blue-600 group-hover:border-blue-400"
                      }`}
                  >
                    {index + 1}
                  </div>

                  {/* Step label */}
                  <span className="text-lg font-medium">{step.name}</span>
                </Link>
              </motion.li>
            )
          })}
        </ul>
      </div>
    </nav>
  )
}

