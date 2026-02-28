import { useState, useEffect, useRef } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "../../components/ui/carousel";
import CorouselEventCard from "../CorouselEventCard/CorouselEventCard";
import MobileCarouselCard from "@/components/MobileCarouselCard/MobileCarouselCard";
import { useMediaQuery } from "react-responsive";

function SlidingCard({ data }: any) {
  const isBigScreen = useMediaQuery({
    query: "(min-width: 1024px)",
  });
  const [activeIndex, setActiveIndex] = useState(0); // Track active slide
  const totalItems = data.length;
  const carouselRef = useRef<HTMLDivElement>(null);

  // Function to go to the next slide
  const goToNextSlide = () => {
    setActiveIndex((prevIndex) => (prevIndex + 1) % totalItems); // Loop back to 0 after the last item
  };

  useEffect(() => {
    const interval = setInterval(goToNextSlide, 3000); // Change slide every 3 seconds

    // Cleanup interval on component unmount
    return () => {
      clearInterval(interval);
    };
  }, []);

  // Handle navigation to specific slide (if user clicks on a navigation button)
  const handleNavigation = (index: number) => {
    setActiveIndex(index);
  };

  return (
    <div className="relative">
      {/* Carousel */}
      <Carousel ref={carouselRef}>
        <CarouselContent
          className="flex transition-transform duration-500 ease-in-out"
          style={{
            transform: `translateX(-${activeIndex * 100}%)`, // Slide effect
          }}>
          {isBigScreen &&
            data.map((item: any, index: any) => (
              <CarouselItem
                key={index}
                className="flex justify-center items-center">
                {/* Image Section */}
                <div
                  className="w-[500px] h-[275px] mt-5 mr-5 rounded-2xl"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}>
                  <img
                    src={item.poster}
                    alt={`Slide ${index + 1}`}
                    className="w-full h-full rounded-md"
                  />
                </div>
                {/* Card Section */}
                <div className="w-[500px]">
                  <CorouselEventCard
                    eventType={item.type}
                    eventName={item.name}
                    dateTime={item.date + " " + item.time}
                    id={item.id}
                    clubName={item.club.name}
                    description={item.description}
                    logoUrl={item.club.logo}
                    instagramUrl={item.club.instagram_url}
                    daysLeft={
                      Date.now() - item.date > 0
                        ? `${Date.now() - item.date} Days Left`
                        : Date.now() == item.date &&
                            new Date().getHours() > item.time.getHours()
                          ? `${new Date().getHours() - item.time.getHours()} Hours Left`
                          : "0 Days Left"
                    }
                  />
                </div>
              </CarouselItem>
            ))}
          {!isBigScreen &&
            data.map((item: any, index: any) => (
              <CarouselItem
                key={index}
                className="flex justify-center items-center">
                <MobileCarouselCard
                  eventType={item.type}
                  eventName={item.name}
                  dateTime={item.date + " " + item.time}
                  id={item.id}
                  clubName={item.club.name}
                  description={item.description}
                  logoUrl={item.club.logo}
                  instagramUrl={item.club.instagram_url}
                  daysLeft={
                    Date.now() - item.date > 0
                      ? `${Date.now() - item.date} Days Left`
                      : Date.now() == item.date &&
                          new Date().getHours() > item.time.getHours()
                        ? `${new Date().getHours() - item.time.getHours()} Hours Left`
                        : "0 Days Left"
                  }
                  imageUrl={item.poster}
                />
              </CarouselItem>
            ))}
        </CarouselContent>
      </Carousel>

      {/* Navigation Buttons */}
      <div className="flex justify-center mt-4 space-x-2">
        {data.map((_: any, index: any) => (
          <button
            key={index}
            onClick={() => handleNavigation(index)}
            className={`w-4 h-4 rounded-full ${
              activeIndex === index ? "bg-blue-500" : "bg-gray-300"
            }`}></button>
        ))}
      </div>
    </div>
  );
}

export default SlidingCard;
