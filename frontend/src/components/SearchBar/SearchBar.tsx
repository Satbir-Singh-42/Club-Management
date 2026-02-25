import { useState, useEffect } from "react";

const SearchBar = ({ value, onChange }: { value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) => {
  const [searchTerm, setSearchTerm] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      onChange({ target: { value: searchTerm } } as React.ChangeEvent<HTMLInputElement>);
    }, 300); // Adjust delay as needed

    return () => clearTimeout(handler);
  }, [searchTerm, onChange]);

  return (
    <div className="flex items-center justify-center mt-2 py-4 px-2 sm:py-2 sm:px-1">
      {/* Card Container with larger width on large screens */}
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-lg py-3 px-3">
        <div className="flex items-center justify-between w-full">
          {/* Input Field Container */}
          <div className="flex items-center flex-grow h-10 bg-gray-200 border border-gray-300 rounded-lg">
            {/* Search Icon */}
            <div className="pl-2 pr-2 text-gray-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
                className="h-4 w-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-4.35-4.35m1.1-5.4a7.5 7.5 0 11-15 0 7.5 7.5 0 0115 0z"
                />
              </svg>
            </div>

            {/* Input Box */}
            <input
              type="text"
              placeholder="Search..."
              className="flex-grow px-0 py-2 text-sm text-gray-700 bg-gray-200 outline-none border-none placeholder-gray-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Button Container */}
          <div className="ml-2 sm:ml-4">
            <button className="bg-blue-500 text-white py-2 px-4 sm:py-2 sm:px-2 text-sm font-medium rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300">
              Search
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
