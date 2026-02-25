
const ClubCard = () => {
  return (
    <div className="max-w-sm mx-auto border border-gray-200 rounded-lg shadow-lg overflow-hidden">
      {/* Header Section */}
      <div className="p-4 flex justify-between items-center bg-white">
        <div className="flex items-center">
          {/* Club Logo */}
          <img
            src="/gndec.svg" // Path to the PNG file in the public folder
            alt="Club Logo"
            className="h-10 w-10 rounded-full"
          />
          {/* Club Name */}
          <h1 className="ml-3 text-lg font-semibold text-gray-800">
            Club's Name
          </h1>
        </div>
        {/* Instagram Icon */}
        <a
          href="#"
          target="_blank"
          rel="noopener noreferrer"
          className="text-pink-500 hover:text-pink-600"
          aria-label="Instagram Link"
        >
          <img
            src="/instagram.png" // Replace with the correct path to your PNG image in the public folder
            alt="Instagram"
            className="h-6 w-6" // You can adjust the size as needed
          />
        </a>
      </div>

      {/* Description Section */}
      <div className="p-4 bg-gray-100">
        <p className="text-gray-600 text-sm text-center">lorem100

        </p>
      </div>

      {/* Button Section */}
      <div className="p-4 bg-white">
        <a
          href="#"
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
