import React, { useEffect, useState } from "react";
import Navbar from "@/components/Navbar/Navbar"; // Navbar component
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Calendar, Clock, MapPin, Pencil, Trash2, Link, ImageIcon } from "lucide-react";
import axios from "axios";

// This would typically come from an API or database

export default function DraftsPage() {
  const [clubId, setClubId] = useState<number | null>(null);
  const [eventData, setEventData] = useState<any>([]);

  useEffect(()=>{
    fillInitialData();
  },[])
  
  useEffect(()=>{
    fetchEvents();
  },[clubId]);

  const fillInitialData = async() => {
    try {
      const response:any = await axios.get("http://localhost:8000/auth/me",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      console.log("response: ", response);
      console.log(response.data.id);
      setClubId(response.data.id);
    } catch (err: any) {
      console.log(`Failed to load user details:${err}`);
    } 
  }

  const fetchEvents = async () => {
    try {
      console.log("Club ID:", clubId);
      const response = await axios.get<any>("http://localhost:8000/events/drafts/events", {
        params: {
          club_id: clubId,
        },
      });

      const fetchedEvents = response.data.map((event: any) => ({
        id: event.id,
        name: event.name,
        tagline: event.tagline,
        about: event.description,
        venue: event.venue,        
        time: `${event.date} ${event.time}`,
        instagram: event.club?.instagram_url,
        coverImage: event.poster,
        lastEdited: event.updated_at,
      }));

      setEventData(fetchedEvents);

    } catch (error) {
      console.error("Failed to fetch events:", error);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Your Draft Posts</h1>
          <Button variant="outline">Create New Post</Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {eventData.map((post:any) => (
            <Card key={post.id} className="bg-white shadow-lg">
              <CardHeader className="border-b">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-bold">{post.name}</h2>
                    <p className="text-sm text-muted-foreground">{post.tagline}</p>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    Last edited: {new Date(post.lastEdited).toLocaleDateString()}
                  </span>
                </div>
              </CardHeader>

              <CardContent className="space-y-4 pt-4">
                <div className="aspect-video relative bg-muted rounded-lg overflow-hidden">
                  {post.coverImage ? (
                    <img
                      src={post.coverImage}
                      alt="Event cover"
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <ImageIcon className="h-10 w-10 text-muted-foreground" />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <p className="text-sm line-clamp-2">{post.about}</p>

                  <div className="grid gap-2 text-sm">
                 
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{post.venue}</span>
                    </div>

                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{new Date(post.time).toLocaleTimeString()}</span>
                    </div>

                    {(post.instagram) && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Link className="h-4 w-4" />
                        <span>Social media links added</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>

              <CardFooter className="border-t pt-4 flex justify-between">
                <Button variant="outline" size="sm">
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit Draft
                </Button>
                <Button variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}