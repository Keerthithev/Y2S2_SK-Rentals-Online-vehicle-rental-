"use client"

import { useState } from "react"
import VehicleFeedbackComponent from "./vehicle-feedback"
import AddFeedbackForm from "./add-feedback-form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MessageSquare, PlusCircle } from "lucide-react"

export default function VehicleReviews({ vehicleID }) {
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleFeedbackAdded = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Tabs defaultValue="reviews" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="reviews" className="flex items-center">
            <MessageSquare className="w-4 h-4 mr-2" />
            View Reviews
          </TabsTrigger>
          <TabsTrigger value="add-review" className="flex items-center">
            <PlusCircle className="w-4 h-4 mr-2" />
            Write a Review
          </TabsTrigger>
        </TabsList>
        <TabsContent value="reviews">
          <VehicleFeedbackComponent vehicleID={vehicleID} refreshTrigger={refreshTrigger} />
        </TabsContent>
        <TabsContent value="add-review">
          <AddFeedbackForm vehicleID={vehicleID} onFeedbackAdded={handleFeedbackAdded} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
