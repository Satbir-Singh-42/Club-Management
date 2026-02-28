import { useEffect, useState, type FC } from "react";
import Navbar from "@/components/Navbar/Navbar"; // Navbar component
import SearchBar from "@/components/SearchBar/SearchBar"; // SearchBar component

import EventCard from "@/components/DashEventCard/DashEventCard"; // EventCard component
import "./Dashboard.css"; // Import the CSS file for styling
import axios from "axios";
import { API_BASE_URL } from "@/config/api";

interface EventCardProps {
  id: number;
  eventType: string;
  eventName: string;
  dateTime: string;
  clubName: string;
  description: string;
  daysLeft: string;
  logoUrl: string;
  instagramUrl: string;
}

const Home: FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [, setLoading] = useState<boolean>(false);
  const [events, setEvents] = useState<EventCardProps[]>([]);
  const [clubId, setClubId] = useState<number | null>(null);
  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await axios.get<any>(`${API_BASE_URL}/events`, {
        params: {
          club_id: clubId || undefined,
        },
      });

      const fetchedEvents = response.data.map((event: any) => ({
        id: event.id,
        eventType: event.type || "N/A",
        eventName: event.name,
        dateTime: `${event.date} ${event.time}`,
        clubName: event.club?.name || "Not Available",
        description: event.description,
        daysLeft: calculateDaysLeft(event.date),
        logoUrl: event.club?.logo || "N/A",
        instagramUrl: event.club?.instagram || "N/A",
      }));
      console.log(fetchedEvents);
      setEvents(fetchedEvents);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch events:", error);
      setLoading(false);
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
    fillInitialData();
  }, []);

  const fillInitialData = async () => {
    try {
      const response: any = await axios.get(`${API_BASE_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setClubId(response.data.id);
      console.log("id: ", response.data.id);
      // set user details in state
    } catch (err: any) {
      console.log(`Failed to load user details:${err}`);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [clubId, searchQuery]);

  const onDeleteEvent = async (id: number) => {
    try {
      await axios.delete(`${API_BASE_URL}/events/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      alert("Event Deleted Successfully");
      setEvents(events.filter((event) => event.id != id));
    } catch (error: any) {
      console.log("Error Deleting Event: ", error.message);
    }
  };

  return (
    <div className="dashboard-page">
      {/* Render Navbar */}
      <Navbar />

      {/* Render Search Bar */}
      <SearchBar
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      {/* Render Event Cards */}
      <div className="dashboard-grid mb-8">
        {events.map((event, index) => (
          <EventCard key={index} {...event} onDeleteEvent={onDeleteEvent} />
        ))}
      </div>
    </div>
  );
};

export default Home;
