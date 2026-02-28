import type { FC } from "react";
import { FaRegClock } from "react-icons/fa";
import "./CorouselEventCard.css";
import { useNavigate } from "react-router-dom";

interface CorouselEventCardProps {
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

const CorouselEventCard: FC<CorouselEventCardProps> = ({
  id,
  eventName,
  dateTime,
  clubName,
  description,
  daysLeft,
  instagramUrl,
}) => {
  const navigate = useNavigate();
  return (
    <div className="corousel-event-card">
      <div className="corousel-event-header">
        {/* Middle Section: Event Details */}
        <div className="corousel-event-details">
          <h2 className="corousel-event-name">{eventName}</h2>
          <p className="corousel-event-date-time">{dateTime}</p>
          <p className="corousel-club-name">{clubName}</p>
        </div>

        {/* Right Section: Instagram Icon */}
        <div className="corousel-instagram-container">
          <a href={instagramUrl} target="_blank" rel="noopener noreferrer">
            <img
              src="/instagram.png"
              alt="Instagram"
              className="corousel-instagram-icon"
            />
          </a>
        </div>
      </div>

      {/* Description Section */}
      <div className="corousel-event-description">
        <p>{description}</p>
      </div>

      {/* Footer Section */}
      <div className="corousel-event-footer">
        <p className="corousel-days-left">
          <FaRegClock className="mr-1" /> {daysLeft}
        </p>
        <div className="corousel-event-actions">
          <button
            className="corousel-read-more-button"
            onClick={() => navigate(`/event/${id}`)}>
            Read more
          </button>
          <button className="corousel-apply-button">Apply</button>
        </div>
      </div>
    </div>
  );
};

export default CorouselEventCard;
