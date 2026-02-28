"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Trash2 } from "lucide-react";
import axios from "axios";
import { API_BASE_URL } from "@/config/api";

interface Club {
  id: number;
  clubName: string;
  email: string;
  facultyAdvisor: string;
  facultyContact: string;
  convenor: string;
  convenorContact: string;
  logo: string;
}

export default function ClubTable() {
  const [searchQuery, setSearchQuery] = useState("");
  const [clubToDelete, setClubToDelete] = useState<number | null>(null);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState("11");
  const [clubs, setClubs] = useState<Club[]>([]);

  useEffect(() => {
    getClubData();
  }, []);

  const getClubData = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/clubs/`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const fetchedClubs = response.data.map((club: any) => ({
        id: club.id,
        clubName: club.name,
        email: club.email,
        facultyAdvisor: club.faculty_advisor || "Not Available",
        facultyContact: club.faculty_contact || "Not Available",
        convenor: club.convenor || "Not Available",
        convenorContact: club.convenor_contact || "Not Available",
        logo: club.logo,
      }));

      setClubs(fetchedClubs);
    } catch (error: any) {
      console.log("Error Fetching Clubs: ", error.message);
    }
  };

  const handleDeleteClub = (club: Club) => {
    setClubToDelete(club.id);
    setShowDeleteAlert(true);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`${API_BASE_URL}/clubs/${clubToDelete}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      getClubData();
      console.log("Club deleted successfully");
    } catch (error: any) {
      console.log("Error Deleting Club:", error.message);
    }
    setClubToDelete(null);
    setShowDeleteAlert(false);
  };

  const filteredClubs = clubs.filter((club) =>
    Object.values(club).some((value) =>
      value.toString().toLowerCase().includes(searchQuery.toLowerCase()),
    ),
  );

  const totalPages = Math.ceil(filteredClubs.length / parseInt(rowsPerPage));
  const paginatedClubs = filteredClubs.slice(
    (currentPage - 1) * parseInt(rowsPerPage),
    currentPage * parseInt(rowsPerPage),
  );

  return (
    <div className="min-h-screen space-y-8 bg-background p-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Clubs Dashboard</h1>
          <p className="text-muted-foreground">
            Manage and monitor all Clubs in the system
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-8 rounded-xl border bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Press ENTER to Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead>Sr.No.</TableHead>
                <TableHead>Club Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Faculty Advisor</TableHead>
                <TableHead>Faculty Advisor's Contact</TableHead>
                <TableHead>Convenor</TableHead>
                <TableHead>Convenor's Contact</TableHead>
                <TableHead>Logo</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedClubs.map((club, index) => (
                <TableRow key={club.id} className="group">
                  <TableCell className="font-medium">
                    {(currentPage - 1) * parseInt(rowsPerPage) + index + 1}
                  </TableCell>
                  <TableCell className="font-medium">{club.clubName}</TableCell>
                  <TableCell>{club.email}</TableCell>
                  <TableCell>{club.facultyAdvisor}</TableCell>
                  <TableCell>{club.facultyContact}</TableCell>
                  <TableCell>{club.convenor}</TableCell>
                  <TableCell>{club.convenorContact}</TableCell>
                  <TableCell>
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={club.logo} alt={club.clubName} />
                      <AvatarFallback>{club.clubName}</AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="bg-transparent"
                        onClick={() => handleDeleteClub(club)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Rows per page:
            </span>
            <Select
              value={rowsPerPage}
              onValueChange={(value) => {
                setRowsPerPage(value);
                setCurrentPage(1);
              }}>
              <SelectTrigger className="w-[70px]">
                <SelectValue>{rowsPerPage}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="11">11</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">
              Showing {(currentPage - 1) * parseInt(rowsPerPage) + 1}-
              {Math.min(
                currentPage * parseInt(rowsPerPage),
                filteredClubs.length,
              )}{" "}
              of {filteredClubs.length} entries
            </span>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}>
              Previous
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(page)}
                className="bg-blue-500 text-white focus:ring-0 active:ring-0 border-0">
                {page}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setCurrentPage((prev) => Math.min(totalPages, prev + 1))
              }
              disabled={currentPage === totalPages}>
              Next
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Club</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this Club? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteAlert(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
