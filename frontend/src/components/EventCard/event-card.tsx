// neerabh event page ka h yeh
import React from 'react'
import { Link2, Instagram } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

interface EventCardProps {
  title: string
  organization: string
  type: string
  daysLeft: number
  startDate: string
}

export function EventCard({ title, organization, type, daysLeft, startDate }: EventCardProps) {
  return (
    <Card className="w-full bg-white">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            <p className="text-gray-500">{organization}</p>
            <Badge variant="secondary" className="rounded-full bg-gray-100 text-gray-600 hover:bg-gray-100">
              {type}
            </Badge>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-600">
              <Link2 className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-600">
              <Instagram className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
            Description
          </h3>

          <div className="flex flex-wrap gap-4">
            <Badge 
              variant="secondary" 
              className="rounded-full px-4 py-1.5 bg-gray-50 text-gray-600 hover:bg-gray-50 text-sm font-medium"
            >
              {daysLeft} DAYS LEFT
            </Badge>
            <Badge 
              variant="secondary" 
              className="rounded-full px-4 py-1.5 bg-gray-50 text-gray-600 hover:bg-gray-50 text-sm font-medium"
            >
              STARTS {startDate}
            </Badge>
            <div className="flex-grow flex justify-end">
              <Button 
                className="bg-[#4169E1] hover:bg-[#3154b3] text-white rounded-full px-6"
              >
                Apply now
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

