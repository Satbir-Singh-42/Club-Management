import axios from "axios";
import React, { useEffect, useState } from "react";

const FilterDialog = ({ isOpen, onClose, onFilterChange }: any) => {
  const [clubs, setClubs] = useState<{ value: string; label: string }[]>([]);
  const [filters, setFilters] = useState({
    club_id: "",
    search: "",
    start_date: "",
    end_date: "",
    sort_by: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters((prev: any) => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    onFilterChange(filters);
    onClose();
  };

  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const response = await axios.get<any>("http://localhost:8000/clubs");
        setClubs([
          { value: "", label: "All Clubs" }, // Default option
          ...response.data.map((club: any) => ({
            value: club.id.toString(),
            label: club.name,
          })),
        ]);
      } catch (error) {
        console.error("Error fetching clubs:", error);
      }
    };

    fetchClubs();
  }, []);

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[400px] md:w-[500px]">
            <h2 className="text-lg font-semibold mb-4">Filter Options</h2>

            {/* Search Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium">Search</label>
              <input
                type="text"
                name="search"
                placeholder="Search events..."
                value={filters.search}
                onChange={handleChange}
                className="border p-2 rounded-md w-full mt-1"
              />
            </div>

            {/* Club Filter */}
            <div className="mb-4">
              <label className="block text-sm font-medium">Club</label>
              <select
                name="club_id"
                value={filters.club_id}
                onChange={handleChange}
                className="border p-2 rounded-md w-full mt-1"
              >
                {clubs.map((club: any) => (
                  <option key={club.value} value={club.value}>
                    {club.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium">Start Date</label>
                <input
                  type="date"
                  name="start_date"
                  value={filters.start_date}
                  onChange={handleChange}
                  className="border p-2 rounded-md w-full mt-1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">End Date</label>
                <input
                  type="date"
                  name="end_date"
                  value={filters.end_date}
                  onChange={handleChange}
                  className="border p-2 rounded-md w-full mt-1"
                />
              </div>
            </div>

            {/* Sort By */}
            <div className="mb-4">
              <label className="block text-sm font-medium">Sort By</label>
              <select
                name="sort_by"
                value={filters.sort_by}
                onChange={handleChange}
                className="border p-2 rounded-md w-full mt-1"
              >
                <option value="-date">Date (Descending)</option>
                <option value="date">Date (Ascending)</option>
                <option value="-name">Name (Z-A)</option>
                <option value="name">Name (A-Z)</option>
              </select>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400 transition"
              >
                Cancel
              </button>
              <button
                onClick={applyFilters}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FilterDialog;
