import React from "react";
import './DashEventCard.css';
import { FaRegClock } from "react-icons/fa";
import { FaEdit } from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";
import { useNavigate } from "react-router";
import axios from "axios";

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
  onDeleteEvent: any;
}

const EventCard: React.FC<EventCardProps> = ({
  id,
  eventType,
  eventName,
  dateTime,
  clubName,
  description,
  daysLeft,
  instagramUrl,
  logoUrl,
  onDeleteEvent,
}) => {
  const navigate = useNavigate();

  

  return (
    <div className="event-card">
      <div className="event-header">
        {/* Left Section: Club Logo */}
        <div className="event-logo-container">
          <img src={'/gndec.svg'} alt="Club Logo" className="event-logo" />
        </div>

        {/* Middle Section: Event Details */}
        <div className="event-details">
          <span className="event-type">{eventType}</span>
          <h2 className="event-name">{eventName}</h2>
          <p className="event-date-time">{dateTime}</p>
          <p className="club-name">{clubName}</p>
        </div>

        {/* Right Section: Instagram Icon */}
        <div className="instagram-container">
          <a href={instagramUrl} target="_blank" rel="noopener noreferrer">
            <img src="/instagram.png" alt="Instagram" className="instagram-icon" />
          </a>
        </div>
      </div>

      {/* Description Section */}
      <div className="event-description">
        <p>{description}</p>
      </div>

      {/* Footer Section */}
      <div className="event-footer">
        <p className="days-left text-right">
          <FaRegClock className="mr-1" /> {daysLeft} days left
        </p>
        <div className="event-actions">
          <button className="bg-blue-500 text-white py-2 px-2 rounded-md shadow hover:bg-blue-600">View</button>
        </div>
        <div className="event-actions">
          <button className="bg-blue-500 text-white py-2 px-2 rounded-md shadow hover:bg-blue-600"
          onClick={() => navigate(`/event-form/${id}`)}
          ><FaEdit size={20}/></button>
        </div>
        <div className="event-actions">
          <button className="bg-blue-500 text-white py-2 px-2 rounded-md shadow hover:bg-blue-600"
           onClick = {()=>onDeleteEvent(id)}
          ><MdDeleteForever size={20}/></button>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
