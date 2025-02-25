import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function FeedbackPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Feedback & Reports</h1>
      <Card>
        <CardHeader>
          <CardTitle>AI-Generated Feedback</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea className="min-h-[200px] text-lg" placeholder="AI-generated feedback will appear here..." />
          <div className="mt-4 flex space-x-4">
            <Button variant="outline" size="lg" className="text-lg">
              Regenerate
            </Button>
            <Button variant="outline" size="lg" className="text-lg">
              Edit Feedback
            </Button>
            <Button size="lg" className="text-lg">
              Approve & Next
            </Button>
          </div>
        </CardContent>
      </Card>
      <div className="flex space-x-4">
        <div className="w-1/2">
          <label htmlFor="tone" className="block text-sm font-medium text-gray-700">
            Feedback Tone
          </label>
          <Select>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select tone" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="formal">Formal</SelectItem>
              <SelectItem value="informal">Informal</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="w-1/2">
          <label htmlFor="length" className="block text-sm font-medium text-gray-700">
            Feedback Length
          </label>
          <Select>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select length" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="short">Short</SelectItem>
              <SelectItem value="detailed">Detailed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Performance Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-64 rounded-lg bg-gray-100 p-4">
              <p className="text-center text-gray-500">Graphs displaying performance insights will appear here</p>
            </div>
            <div className="flex space-x-4">
              <Button variant="outline" size="lg" className="text-lg">
                Export as Excel
              </Button>
              <Button variant="outline" size="lg" className="text-lg">
                Publish to Canvas
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

