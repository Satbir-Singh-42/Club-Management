interface ClubData {
  id: number;
  name: string;
  acronym: string;
  logo: string;
  instagram_url: string;
  featuredImage: string;
  highlights: string[];
  websiteLink: string;
}

interface ClubCardProps {
  logo: string; // URL for the club logo
  name: string;
  instagram_url: string;
  featuredImage: string; // URL for the featured event image
  featuredLabel: string; // Label for the featured section (e.g., "FEATURED")
  eventTitle: string;
  eventDate: string;
  eventLocation: string;
  highlights: string[]; // Array of event highlights
  websiteLink: string; // URL for the website link
}

const ClubCard: React.FC<ClubData> = ({
  id,
  logo,
  name,
  acronym,
  instagram_url,
  featuredImage,
  highlights,
  websiteLink,
}) => {
  return (
    <div className="w-full max-w-[500px] h-auto mx-auto border border-gray-200 rounded-lg shadow-lg overflow-hidden flex flex-col bg-white">
      {/* Header Section */}
      <div className="p-4 flex justify-between items-center bg-white">
        <div className="flex items-center">
          {/* Club Logo */}
          <img
            src={logo}
            alt="Club Logo"
            className="h-10 w-10 rounded-full"
          />
          {/* Club Name */}
          <h1 className="ml-3 text-lg font-semibold text-gray-800">
            {name}
          </h1>
        </div>
        {/* Instagram Icon */}
        <a
          href={instagram_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-pink-500 hover:text-pink-600"
          aria-label="Instagram Link"
        >
          <img
            src="/instagram.png"
            alt="Instagram"
            className="h-6 w-6"
          />
        </a>
      </div>

      {/* Featured Event Section */}
      <div className="relative">
        <img
          src={featuredImage}
          alt="Event Banner"
          className="w-full h-48 object-cover"
        />
        
        <div className="absolute bottom-2 left-4 text-white">
          <h2 className="text-lg font-bold">{acronym}</h2>
          {/* <p className="text-sm">{eventDate}, {eventLocation}</p> */}
        </div>
      </div>

      {/* Event Highlights Section */}
      <div className="p-4 bg-gray-100">
        <ul className="space-y-2 text-gray-700">
          {highlights? highlights.map((highlight, index) => (
            <li key={index} className="flex font-bold items-center">
              <span className="text-yellow-500 mr-2">⭐</span>
              {highlight}
            </li>
          ))
          :
          <> 
          <li key="1.1.1" className="flex items-center font-bold">
            <span className="text-yellow-500 mr-2">⭐</span>
            This is the First Highlight
          </li>
            <li key="1.1.2" className="flex items-center font-bold">
            <span className="text-yellow-500 mr-2">⭐</span>
            This is the Second Highlight
          </li>
          <li key="1.1.3" className="flex items-center font-bold">
            <span className="text-yellow-500 mr-2">⭐</span>
            This is the Third Highlight
          </li>
        </>
          }
        </ul>
      </div>

      {/* Button Section */}
      <div className="p-4">
        <a
          href={websiteLink}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full text-center py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700"
        >
          Visit Website
        </a>
      </div>
    </div>
  );
};

export default ClubCard;