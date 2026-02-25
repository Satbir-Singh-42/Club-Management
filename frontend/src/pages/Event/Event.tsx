'use client'

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "@/components/Navbar/Navbar";
import { Link2, Twitter, Linkedin} from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import axios from "axios";
import DOMPurify from "dompurify";

type Event = {
  id: number;
  title: string;
  club: string;
  startDate: string;
  daysLeft: number;
  type: string;
};

export default function EventPage() {
  const { event_id } = useParams(); // Extract event_id from the URL
  const [eventData, setEventData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<any>(null);
  const [events, setEvents] = useState<Event[]>([]);
  
  useEffect(() => {
    // Fetch event data dynamically
    const fetchEventData = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/events/${event_id}`);
        setEventData(response.data);
      } catch (err:any) {
        console.log(`Failed to load event data:${err}`);
      } finally {
        setLoading(false);
      }
    };

    fetchEventData();
  }, [event_id]);

  const fetchEvents = async () => {
    try {
      setLoading(true); // Start loading
      const response = await axios.get<any>("http://localhost:8000/events", {
        params: {
          limit: 4, // Set your default limit or pass dynamic params
          sort_by: "date",
        },
      });
      console.log(response);
      const fetchedEvents = response.data.map((event:any) => ({
        id: event.id,
        type: event.type || "N/A",
        startDate: event.date,
        title: event.name,
        club: event.club?.name || "N/A",
        daysLeft: calculateDaysLeft(event.date),
      }));
      setEvents(fetchedEvents);
    } catch (error: any) {
      console.error("Failed to fetch events:", error);
    } finally {
      setLoading(false); // Stop loading
    }
  };

  const calculateDaysLeft = (date: string): string => {
    const today = new Date();
    const eventDate = new Date(date);
    const diffTime = eventDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays.toString() : "0";
  };

  useEffect(() => {
      fetchEvents();
    }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-600">Loading event details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!eventData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-600">Event not found.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Navbar */}
      <Navbar />
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          {eventData.name}
        </h1>

        <div className="grid gap-6 lg:grid-cols-[1fr,400px]">
          <Card className="bg-white p-6 space-y-8">
            <div className="aspect-[16/9] relative overflow-hidden rounded-lg">
              <img
                src={eventData.poster || "/placeholder.png"} // Use poster or fallback
                alt={eventData.name}
                className="object-cover w-full h-full"
              />
            </div>

            <div className="prose max-w-none">
              <h2 className="text-xl mb-4"   dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(eventData.description) }}>
              </h2>
              <p className="text-gray-600 text-xl mb-4" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(eventData.rules) }}>
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Kindly Follow the Above Rules</h3>
              <p className="text-gray-600">
                Follow the Code of Conduct
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Find us on</h3>
              <div className="flex space-x-4">
                <Button variant="outline" size="icon">
                  <Twitter className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <Linkedin className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>

          <Card className="bg-white p-6 shadow-sm h-fit">
            <div className="flex justify-end space-x-2 mb-6">
              <button className="text-gray-400 hover:text-gray-600 bg-gray-50 rounded-full p-2">
                <Link2 className="h-4 w-4" />
              </button>
              <button className="text-gray-400 hover:text-gray-600 bg-gray-50 rounded-full p-2">
                <Twitter className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="border-l-2 border-blue-600 pl-4">
                <h3 className="text-xs font-medium text-gray-500 uppercase mb-1">
                  DATE AND TIME
                </h3>
                <p className="text-gray-900">
                  {eventData.date} | {eventData.time}
                </p>
              </div>

              <div className="border-l-2 border-blue-600 pl-4">
                <h3 className="text-xs font-medium text-gray-500 uppercase mb-1">
                  VENUE
                </h3>
                <p className="text-gray-900">{eventData.venue || "Online"}</p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-xs font-medium text-blue-600 uppercase mb-1">
                  APPLICATIONS CLOSE IN
                </h3>
                <p className="text-blue-600 font-medium">0d:7h:11m</p>
              </div>

              <Button className="w-full bg-[#4169E1] hover:bg-[#3154b3] text-white rounded-lg py-2 text-sm font-medium">
                Apply now
              </Button>
            </div>
          </Card>
        </div>

      <div className="mt-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">More Events</h2>
          <Button variant="link" className="text-[#4169E1] hover:text-[#3154b3] font-semibold">
            See all open Events →
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {events.map((event) => (
            <Card key={event.id} className="bg-white p-6">
              <div className="flex justify-between items-start mb-6">
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-gray-900">{event.title}</h2>
                  <p className="text-gray-500">{event.club?.name || "N/A"}</p>
                  <div className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-gray-100 text-gray-800">
                    {event.type}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="text-gray-400 hover:text-gray-600">
                    <Link2 className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </h3>
                <div className="flex flex-wrap gap-4 items-center">
                  <div className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-gray-100 text-gray-800">
                    {event.daysLeft} DAYS LEFT
                  </div>
                  <div className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-gray-100 text-gray-800">
                    STARTS {event.startDate}
                  </div>
                  <div className="flex-grow flex justify-end">
                    <Button className="bg-[#4169E1] hover:bg-[#3154b3] text-white rounded-full px-6 py-2 text-sm font-semibold">
                      Apply now
                    </Button>
                  </div>
                </div>
              </div>
            </Card>          
          ))}
        </div>
      </div>

      <footer className="mt-12 text-center text-gray-500 text-sm">
        © 2025 Club Hub
      </footer>
    </div>
    </div>  
  )
}  
