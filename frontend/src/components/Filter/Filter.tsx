import React, { useEffect, useState } from "react";
import { IoFilterSharp } from "react-icons/io5";
import axios from "axios";
import { API_BASE_URL } from "@/config/api";

interface FilterProps {
  onFilterChange: (filters: any) => void;
}

const FilterComponent: React.FC<FilterProps> = ({ onFilterChange }) => {
  const [clubs, setClubs] = useState<{ value: string; label: string }[]>([]);
  const [filters, setFilters] = useState({
    club_id: "",
    search: "",
    start_date: "",
    end_date: "",
    sort_by: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    onFilterChange(filters);
  };

  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const response = await axios.get<any>(`${API_BASE_URL}/clubs`);
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
    <div className="flex flex-col md:flex-row items-center justify-evenly bg-white shadow-md p-4 rounded-lg mb-4">
      {/* Club Filter */}
      <select
        name="club_id"
        value={filters.club_id}
        onChange={handleChange}
        className="border p-2 rounded-lg w-full md:w-1/4 mt-2 md:mt-0">
        {clubs.map((club) => (
          <option key={club.value} value={club.value}>
            {club.label}
          </option>
        ))}
      </select>

      {/* Search Bar */}
      <input
        type="text"
        name="search"
        placeholder="Search events..."
        value={filters.search}
        onChange={handleChange}
        className="border p-2 rounded-lg w-full md:w-1/4 mt-2 md:mt-0"
      />

      {/* Start Date Filter */}
      <input
        type="date"
        name="start_date"
        value={filters.start_date}
        onChange={handleChange}
        className="border p-2 rounded-lg w-full md:w-1/4 mt-2 md:mt-0"
      />

      {/* End Date Filter */}
      <input
        type="date"
        name="end_date"
        value={filters.end_date}
        onChange={handleChange}
        className="border p-2 rounded-lg w-full md:w-1/4 mt-2 md:mt-0"
      />

      <select
        name="sort_by"
        value={filters.sort_by}
        onChange={handleChange}
        className="border p-2 rounded-lg w-full md:w-1/4 mt-2 md:mt-0">
        <option value="date">Date (Ascending)</option>
        <option value="-date">Date (Descending)</option>
        <option value="name">Name (A-Z)</option>
        <option value="-name">Name (Z-A)</option>
      </select>

      {/* Apply Button */}
      <button
        onClick={applyFilters}
        className="bg-blue-600 text-xl text-white p-2 rounded-lg flex items-center mt-2 md:mt-0">
        <IoFilterSharp className="mr-2" /> Apply
      </button>
    </div>
  );
};

export default FilterComponent;
