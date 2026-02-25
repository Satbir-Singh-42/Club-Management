import React, { useState, useEffect, useRef } from "react";
import Navbar from "@/components/Navbar/Navbar";
import SearchBar from "@/components/SearchBar/SearchBar";
import SlidingCard from "@/components/SlidingCard/SlidingCard";
import EventCard from "@/components/EventCard/EventCard";
// import FilterComponent from "@/components/Filter/Filter";
import "./Home.css";
import axios from "axios";
import FilterDialog from "@/components/FilterDialog/FilterDialog";
import { IoFilterSharp } from "react-icons/io5";

type Event = {
  id: number;
  eventType: string;
  eventName: string;
  dateTime: string;
  clubName: string;
  description: string;
  daysLeft: string;
  logoUrl: string;
  instagramUrl: string;
};

const Home: React.FC = () => {
  const [carouselEvents, setCarouselEvents] = useState<any>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    club_id: "",
    search: "",
    start_date: "",
    end_date: "",
    sort_by: "",
  });
  const observer = useRef<IntersectionObserver>();
  const lastEventElementRef = useRef<HTMLDivElement>(null);

  const EVENTS_PER_PAGE = 10;

  const fetchCarouselEvents = async () => {
    try {
      const response = await axios.get<any>("http://localhost:8000/events", {
        params: {
          skip: 0,
          limit: 3,
        },
      });

      setCarouselEvents(response.data);
    } catch (error) {
      console.error("Failed to fetch events:", error);
    }
  };

  const fetchEvents = async (pageNum: number) => {
    try {
      setLoading(true);
      const response = await axios.get<any>("http://localhost:8000/events", {
        params: {
          skip: (pageNum - 1) * EVENTS_PER_PAGE,
          limit: EVENTS_PER_PAGE,
          club_id: filters.club_id || undefined,
          search: filters.search || undefined,
          start_date: filters.start_date || undefined,
          end_date: filters.end_date || undefined,
          sort_by: filters.sort_by || undefined,
          name: searchQuery || undefined,
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

      setEvents(prev => pageNum === 1 ? fetchedEvents : [...prev, ...fetchedEvents]);
      setHasMore(fetchedEvents.length === EVENTS_PER_PAGE);
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

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
    setPage(1); // Reset pagination when filters change
  };

  useEffect(() => {
    fetchCarouselEvents();
  }, []);
  
  useEffect(() => {
    fetchEvents(page);
  }, [page, filters, searchQuery]);

  useEffect(() => {
    if (loading) return;

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prev => prev + 1);
      }
    });

    if (lastEventElementRef.current) {
      observer.current.observe(lastEventElementRef.current);
    }

    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [loading, hasMore]);

  return (
    <div className="home-page">
      <FilterDialog
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        onFilterChange={handleFilterChange}
      />
      <Navbar />
      <SearchBar value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
      
      {carouselEvents.length && <div>
        <SlidingCard data={carouselEvents}/>
      </div>}

      <div className="bg-[#ebebeb] w-full pr-20 py-2 my-8 text-lg text-right flex items-center justify-end">
        <button className="flex" onClick={()=>setIsFilterOpen(true)}>
          <IoFilterSharp size={20} className="mr-2" />
          Filters
        </button>
      </div>
      {/* <div className="bg-[#ebebeb] py-2 my-4 text-lg">
        <FilterComponent onFilterChange={handleFilterChange} />
      </div> */}

      <div className="events-grid mb-10">
        {events.map((event, index) => (
          <div
            key={index}
            ref={index === events.length - 1 ? lastEventElementRef : null}
            className=""
          >
            <EventCard {...event} />
          </div>
        ))}
        
        {loading && (
          <div className="text-center col-span-full text-lg font-semibold">
            <img src="LoadingHand2.webp" className="loading-img"/>
          </div>
        )}
        
        {!hasMore && !loading && events.length > 0 && (
          <div className="text-center text-lg font-semibold mt-4 rounded-full col-span-full">
            <img src="./AllCaughtUp.png"/>
          </div>
        )}
        
        {!loading && events.length === 0 && (
          <div className="text-center text-lg col-span-full font-semibold">
            <img src="./NoEvents.jpg"/>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;