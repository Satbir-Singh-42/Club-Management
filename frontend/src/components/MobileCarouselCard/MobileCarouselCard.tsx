import type { FC } from "react";
import "./MobileCarouselCard.css";
import { FaRegClock } from "react-icons/fa";
import { useMediaQuery } from "react-responsive";
import { useNavigate } from "react-router-dom";

interface EventCardProps {
  id: string;
  eventType: string;
  eventName: string;
  dateTime: string;
  clubName: string;
  description: string;
  daysLeft: string;
  logoUrl: string;
  instagramUrl: string;
  imageUrl: string;
}

const EventCard: FC<EventCardProps> = ({
  id,
  eventName,
  dateTime,
  clubName,
  daysLeft,
  instagramUrl,
  imageUrl,
}) => {
  const navigate = useNavigate();
  const isVerySmall = useMediaQuery({
    query: "(max-width: 450px)",
  });
  return (
    <div className="mobile-event-card">
      <div className="mobile-event-header">
        {/* Left Section: Club Logo */}
        <div className="mobile-event-logo-container">
          <img
            src={"/gndec.svg"}
            alt="Club Logo"
            className="min-w-10 mobile-event-logo"
          />
        </div>

        {/* Middle Section: Event Details */}
        <div className="mobile-event-details">
          <h2 className="mobile-event-name">{eventName}</h2>
          <p className="mobile-event-date-time">{dateTime}</p>
          <p className="mobile-club-name">{clubName}</p>
        </div>

        {/* Right Section: Instagram Icon */}
        <div className="mobile-instagram-container">
          <a href={instagramUrl} target="_blank" rel="noopener noreferrer">
            <img
              src="/instagram.png"
              alt="Instagram"
              className="mobile-instagram-icon"
            />
          </a>
        </div>
      </div>

      <div
        className="w-full h-[175px] mt-5 mr-5 rounded-2xl"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
        <img
          src={imageUrl}
          alt={`${eventName} Image`}
          className="w-full h-full rounded-md"
        />
      </div>

      {/* Footer Section */}
      <div className="mobile-event-footer">
        <p className="mobile-days-left">
          <FaRegClock className="mr-1" /> {daysLeft} days left
        </p>
        <div className="mobile-event-actions">
          <button
            className="mobile-read-more-button"
            onClick={() => navigate(`/event/${id}`)}>
            {isVerySmall ? "View" : "Read more"}
          </button>
          <button className="mobile-apply-button">Apply</button>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
