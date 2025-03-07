"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"

const steps = [
  { name: "Dashboard", href: "/" },
  { name: "Upload & Knowledge Base", href: "/upload" },
  { name: "Rubric Creation", href: "/rubric" },
  { name: "Student Submissions & Feedback", href: "/submissions" },
  { name: "Reports & Performance", href: "/reports" },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <nav className="w-72 bg-white shadow-lg p-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8">
        <h1 className="text-2xl font-bold text-blue-600">AI Grading</h1>
        <h1 className="text-2xl font-bold text-blue-600">Assistant</h1>
      </motion.div>

      <div className="relative">
        {/* Vertical connector line */}
        <div className="absolute left-3.5 top-5 h-[calc(100%-3.5rem)] w-0.5 bg-blue-100" />

        <ul className="relative space-y-7">
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
                  className="group flex items-center gap-3"
                >
                  {/* Step indicator circle */}
                  <div
                    className={`relative z-10 flex h-7 w-7 items-center justify-center rounded-full border transition-colors
                      ${
                        isActive
                          ? "border-blue-600 bg-blue-600 text-white"
                          : "border-blue-400 bg-white text-blue-600 group-hover:border-blue-500"
                      }`}
                  >
                    <span className="text-sm">{index + 1}</span>
                  </div>

                  {/* Step label */}
                  <span className={`text-sm font-medium ${
                    isActive ? "text-blue-600" : "text-gray-700 group-hover:text-blue-500"
                  }`}>
                    {step.name}
                  </span>
                </Link>
              </motion.li>
            )
          })}
        </ul>
      </div>
    </nav>
  )
}