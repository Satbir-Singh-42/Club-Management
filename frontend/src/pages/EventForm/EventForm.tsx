"use client";

import { useEffect, useState } from "react";
import { Bold, Heading1, Italic, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/utils/utils";
import axios from "axios";
import { Navigate } from "react-router";
import { useParams } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";


export default function EventForm() {
  const { event_id } = useParams(); // Extract event_id from the URL
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [dayName, setDayName] = useState("");
  const [dateToday, setDateToday] = useState("");
  const [clubName, setClubName] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    rules: "",
    draft: false,
    date: "",
    time: "",
    venue: "",
    team_size: "",
    registration_url: "",
    poster: null,
  });

  const fillInitialData = async() => {
    if(!event_id) return
    const response = await axios.get(`http://localhost:8000/events/${event_id}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    )
    setFormData({
      name: response.data.name || "",
      description: response.data.description || "",
      rules: response.data.rules || "",
      draft: response.data.draft || false,
      date: response.data.date || "",
      time: response.data.time || "",
      venue: response.data.venue || "",
      team_size: response.data.team_size || "",
      registration_url: response.data.registration_url || "",
      poster: null,
    })
  }
  useEffect(() =>{
    fillInitialData();
  },[]);

  useEffect(() => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const today = new Date();
    const dayName = days[today.getDay()];
    const monthName = months[today.getMonth()];
    const day = today.getDate();
    const year = today.getFullYear();

    const formattedDate = `${monthName} ${day}, ${year}`; // Using newline for the format you requested
    setDateToday(formattedDate);
    setDayName(dayName);
  }, []);

  // getUserDetails 
  const getUserDetails = async() => {
    // fetch user details from server
    try {
      const response = await axios.get("http://localhost:8000/auth/me",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      console.log(response.data.name)
      setClubName(response.data.name)
      // set user details in state
    } catch (err: any) {
      console.log(`Failed to load user details:${err}`);
    } finally {
    }
  }
  useEffect(()=>{
      getUserDetails(); 
  },[])

  const handleChange = (e:any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleFileChange = (e:any) => {
    setFormData((prev) => ({ ...prev, poster: e.target.files[0] }));
  };
  
  const handleSubmit = async (e:any) => {
    e.preventDefault();
    const formDataToSend = new FormData();
    
    Object.keys(formData).forEach((key:any) => {
      formDataToSend.append(key, formData[key]);
    });
  
    if(!event_id){
      try {
        await axios.post("http://localhost:8000/events/new", formDataToSend, {
          headers: { 
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        alert("Event created successfully!");
        setFormData({
          name: "",
          description: "",
          rules: "",
          draft: false,
          date: "",
          time: "",
          venue: "",
          team_size: "",
          registration_url: "",
          poster: null,
        });
      } catch (error) {
        console.error("Error creating event:", error);
      }
    }
    else{
      try {
        await axios.patch(`http://localhost:8000/events/${event_id}`, formDataToSend, {
          headers: { 
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        alert("Event Updated successfully!");
      } catch (error) {
        console.error("Error creating event:", error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FC] px-6 py-8">
      <div className="max-w-[600px] mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <h1 className="text-[20px] font-bold tracking-tight">{clubName}</h1>
          <div className="text-right">
            <p className="text-[15px] font-medium">{dayName}</p>
            <p className="text-[13px] text-gray-600 whitespace-nowrap">{dateToday}</p>
          </div>
        </div>

        {/* Form Cards */}
        <div className="space-y-4">
          {/* Basic Info Card */}
          <Card className="p-6 bg-white shadow-[0_1px_3px_0_rgba(0,0,0,0.05)]">
            <div className="space-y-5">
              <div>
                <Label className="text-xs font-medium text-gray-500">
                  NAME
                </Label>
                <input
                  type="text"
                  name="name"
                  placeholder="Event Name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full border-2 p-2 rounded-md mt-1.5 border-gray-200"
                />
              </div>

              {/* <div>
                <Label className="text-xs font-medium text-gray-500">
                  TAGLINE
                </Label>
                <input
                  type="text"
                  name="tagline"
                  placeholder="Event Tagline"
                  value={formData.tagline}
                  onChange={handleChange}
                  className="mt-1.5 border-gray-200"
                />
              </div> */}

                    <div>
                      <Label className="text-xs font-medium text-gray-500">DESCRIPTION</Label>
                      <div className="mt-1.5 border border-gray-200 overflow-hidden">
                        <ReactQuill
                          value={formData.description}
                          onChange={(value:any)=> setFormData((prev) => ({ ...prev, "description": value }))}
                          modules={{
                            toolbar: [
                              ["bold", "italic", "underline"], // Formatting buttons
                              [{ header: [1, 2, false] }], // Heading options
                              [{ list: "ordered" }, { list: "bullet" }], // Lists
                              ["link"], // Links
                            ],
                          }}
                          className="bg-white"
                        />
                      </div>
                    </div>
                  <div>
                <Label className="text-xs font-medium text-gray-500">
                  Rules (Optional)
                </Label>
                <div className="mt-1.5 border border-gray-200 overflow-hidden">
                  <ReactQuill
                    value={formData.rules}
                    onChange={(value:any)=> setFormData((prev) => ({ ...prev, "rules": value }))}
                    modules={{
                      toolbar: [
                        ["bold", "italic", "underline"], // Formatting buttons
                        [{ header: [1, 2, false] }], // Heading options
                        [{ list: "ordered" }, { list: "bullet" }], // Lists
                        ["link"], // Links
                      ],
                    }}
                    className="bg-white"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Applications Card */}
          {/* <Card className="p-6 bg-white shadow-[0_1px_3px_0_rgba(0,0,0,0.05)]">
            <div className="space-y-5">
              <div>
                <Label className="text-xs font-medium text-gray-500">
                  APPLICATIONS OPEN
                </Label>
                <div className="grid grid-cols-2 gap-4 mt-1.5">
                  <Input placeholder="DD/MM/YYYY" className="border-gray-200" />
                  <Input
                    placeholder="HH:MM(24hrs)"
                    className="border-gray-200"
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs font-medium text-gray-500">
                  APPLICATIONS CLOSE
                </Label>
                <div className="grid grid-cols-2 gap-4 mt-1.5">
                  <Input placeholder="DD/MM/YYYY" className="border-gray-200" />
                  <Input
                    placeholder="HH:MM(24hrs)"
                    className="border-gray-200"
                  />
                </div>
              </div>
            </div>
          </Card> */}

          {/* Venue & Time Card */}
          <Card className="p-6 bg-white shadow-[0_1px_3px_0_rgba(0,0,0,0.05)]">
            <div className="space-y-5">
              <div>
                <Label className="text-xs font-medium text-gray-500">
                  VENUE
                </Label>
                <input
                  type="text"
                  name="venue"
                  placeholder="eg. Auditorium"
                  value={formData.venue}
                  onChange={handleChange}
                  className="w-full border-2 border-grey-300 p-2 rounded-md mt-1.5 border-gray-200"
                />
              </div>

              <div>
                <Label className="text-xs font-medium text-gray-500">
                  DATE & TIME
                </Label>
                <div className="grid grid-cols-2 gap-4 mt-1.5">
                  <input
                    type="date"
                    name="date"
                    placeholder="DD/MM/YYYY"
                    value={formData.date}
                    onChange={handleChange}
                    className="w-full border-2 border-grey-300 p-2 rounded-md mt-1.5 border-gray-200"
                  />
                  <input
                    type="time"
                    name="time"
                    placeholder="HH:MM(24hrs)"
                    value={formData.time}
                    onChange={handleChange}
                    className="w-full border-2 border-grey-300 p-2 rounded-md mt-1.5 border-gray-200"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Cover Image Card */}
          <Card className="p-6 bg-white shadow-[0_1px_3px_0_rgba(0,0,0,0.05)]">
            <Label className="text-xs font-medium text-gray-500">
              COVER IMAGE
            </Label>
            <div
              className={cn(
                "mt-1.5 border-2 border-dashed border-[#4F46E5] rounded-lg p-8",
                "flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50/50",
              )}
              onClick={() => document.getElementById("file-upload")?.click()}
            >
              <input type="file" name="poster" accept="image/*" onChange={handleFileChange} />
              <p className="mt-2 text-sm text-[#4F46E5]">
                Drag and drop or click to choose
              </p>
              <p className="text-xs text-[#4F46E5]">
                1080x1080 .png or .jpeg 5 MB max
              </p>
            </div>
          </Card>

          {/* Social Media Card */}
          <Card className="p-6 bg-white shadow-[0_1px_3px_0_rgba(0,0,0,0.05)]">
            <div className="space-y-5">
              <div>
                <Label className="text-xs font-medium text-gray-500">
                  Team Size
                </Label>
                <input
                  type="number"
                  name="team_size"
                  value={formData.team_size}
                  onChange={handleChange}
                  className="w-full border-2 border-grey-300 p-2 rounded-md mt-1.5 border-gray-200"
                />
              </div>
            </div>
            <div className="space-y-5">
              <div>
                <Label className="text-xs font-medium text-gray-500">
                  Registration URL
                </Label>
                <input
                  type="text"
                  name="registration_url"
                  value={formData.registration_url}
                  onChange={handleChange}
                  className="w-full border-2 border-grey-300 p-2 rounded-md mt-1.5 border-gray-200"
                />
              </div>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-between gap-4 pt-6">
            <Button
              variant="ghost"
              className="flex-1 bg-[#EEF2FF] hover:bg-[#EEF2FF]/90 text-gray-700 font-medium"
            >
              Cancel
            </Button>
            <Button
              variant="ghost"
              className="flex-1 bg-[#ECFDF5] hover:bg-[#ECFDF5]/90 text-gray-700 font-medium"
            >
              Save as Draft
            </Button>
            <Button
              className="flex-1 bg-[#4F46E5] hover:bg-[#4F46E5]/90 text-white font-medium"
              onClick={handleSubmit}
            >
              Upload Post
            </Button>
          </div>

          {/* Help Text */}
          <p className="text-center text-sm text-gray-500 pt-6">
            Need help setting up? Email us,{" "}
            <a
              href="mailto:Community@ClubHub.com"
              className="text-[#4F46E5] hover:underline"
            >
              Community@ClubHub.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
