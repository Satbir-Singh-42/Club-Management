import React from "react";
import './EventCard.css';
import { FaRegClock } from "react-icons/fa";
import { useMediaQuery } from "react-responsive";
import { useNavigate } from "react-router-dom";
import DOMPurify from "dompurify";


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

const EventCard: React.FC<EventCardProps> = ({
  id,
  eventType,
  eventName,
  dateTime,
  clubName,
  description,
  daysLeft,
  instagramUrl,
}) => {
  const navigate = useNavigate();
  const isVerySmall = useMediaQuery({
    query: '(max-width: 450px)'
  })
  return (
    <div className="event-card">
      <div className="event-header">
        {/* Left Section: Club Logo */}
        <div className="event-logo-container">
          <img src={'/gndec.svg'} alt="Club Logo" className="event-logo min-w-12"/>
        </div>

        {/* Middle Section: Event Details */}
        <div className="event-details">
          <span className="event-type">{eventType}</span>
          <h2 className="event-name">{eventName}</h2>
          <p className="event-date-time">{dateTime}</p>
          <p className="club-name">{clubName}</p>
        </div>

        {/* Right Section: Instagram Icon */}
        <div className="instagram-container min-w-8">
          <a href={instagramUrl} target="_blank" rel="noopener noreferrer">
            <img src="/instagram.png" alt="Instagram" className="instagram-icon" />
          </a>
        </div>
      </div>

      {/* Description Section */}
      <div
        className="event-description"
        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(description) }}
      />

      {/* Footer Section */}
      <div className="event-footer">
        <p className="days-left">
          <FaRegClock className="mr-1" /> {daysLeft} days left
        </p>
        <div className="event-actions">
          <button className="read-more-button" onClick={()=>navigate(`/event/${id}`)}>{isVerySmall?"View":"Read more"}</button>
          <button className="apply-button">Apply</button>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
