import Navbar from "../../components/Navbar/Navbar"; // Navbar component
import SearchBar from "../../components/SearchBar/SearchBar.tsx"; // SearchBar component
import ClubCard from "../../components/ClubCard/ClubCard.tsx"; // ClubCard component
import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "@/config/api";

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

function ClubPage() {
  const [clubs, setClubs] = useState<ClubData[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const response = await axios.get<any>(`${API_BASE_URL}/clubs`, {
          params: {
            name: searchQuery || undefined,
          },
        });
        const fetchedClubs = response.data.map((club: any) => ({
          id: club.id,
          acronym: club.acronym,
          logo: club.logo,
          instagram_url: club.instagram_url,
          featuredImage: club.featuredImage,
          highlights: club.highlights,
          websiteLink: club.websiteLink,
          name: club.name,
        }));
        setClubs(fetchedClubs);
      } catch (error) {
        console.error("Error fetching clubs:", error);
      }
    };

    fetchClubs();
  }, [searchQuery]);

  return (
    <div className="clubPage">
      {/* Navbar */}
      <Navbar />

      {/* SearchBar */}
      <SearchBar
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      {/* Wrapper for the ClubCards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 p-6">
        {clubs.map((club) => (
          <ClubCard key={club.id} {...club} />
        ))}
      </div>
    </div>
  );
}

export default ClubPage;
