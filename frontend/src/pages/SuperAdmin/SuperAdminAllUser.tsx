"use client";

import React, { useEffect, useState } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Trash2, Users, Download } from "lucide-react";
import axios from "axios";

interface User {
  id: number;
  name: string;
  urn: string;
  crn: string;
  branch: string;
  batch: number;
  contact: string;
  email: string;
  photo: null;
}

export default function UsersTable() {
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [userToDelete, setUserToDelete] = useState<number | null>(null);
  const [profileModalUser, setProfileModalUser] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState("11");
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [showBulkDeleteAlert, setShowBulkDeleteAlert] = useState(false);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(()=>{
    getUserData();
  },[])

  const getUserData = async() => {
    try {
      const response = await axios.get<any>('http://localhost:8000/students/',
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`
          },
        }
      )
      const fetchedClubs = response.data.map((user:any) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        urn: user.urn,
        crn: user.crn,
        branch: user.branch,
        batch: user.batch,
        contact: user.contact,
        photo: user.photo? user.photo : null,
      }))

      setUsers(fetchedClubs);
    } catch (error:any) {
      console.log("Error Fetching Clubs: ", error.message)
    }
  }

  const handleSelectUser = (userId: number) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map((user) => user.id));
    }
  };

  const handleDeleteSelected = () => {
    setShowBulkDeleteAlert(true);
  };

  const confirmBulkDelete = () => {
    console.log("Deleting selected users:", selectedUsers);
    setSelectedUsers([]);
    setShowBulkDeleteAlert(false);
  };

  const handleDeleteUser = (user: User) => {
    setUserToDelete(user.id);
    setShowDeleteAlert(true);
  };

  const confirmDelete = async() => {
    try {
      await axios.delete(`http://localhost:8000/students/${userToDelete}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`
          },
        }
      )
      getUserData();
      console.log("User deleted successfully");
    } catch (error:any) {
      console.log("Error Deleting User:", error.message);
    }
    setUserToDelete(null);
    setShowDeleteAlert(false);
  };

  const handleDownloadProfileImage = (userName: string) => {
    console.log(`Downloading profile image for ${userName}`);
    const link = document.createElement("a");
    link.href = "/placeholder.svg";
    link.download = `${userName.replace(" ", "_")}_profile.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredUsers = users.filter((user) =>
    Object.values(user).some((value) =>
      value.toString().toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const totalPages = Math.ceil(filteredUsers.length / parseInt(rowsPerPage));
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * parseInt(rowsPerPage),
    currentPage * parseInt(rowsPerPage)
  );

  return (
    <div className="min-h-screen space-y-8 bg-background p-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Users Dashboard</h1>
          <p className="text-muted-foreground">
            Manage and monitor all users in the system
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-8 rounded-xl border bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-4">
            {selectedUsers.length > 0 && (
              <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-1">
                <Users className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {selectedUsers.length} selected
                </span>
              </div>
            )}
            {selectedUsers.length > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteSelected}
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Remove Selected
              </Button>
            )}
          </div>
        </div>

        <div className="rounded-lg border">
          <style>{`
            /* Custom styles for transparent checkbox */
            .checkbox-transparent {
              appearance: none; /* Remove default checkbox styles */
              width: 20px; /* Set the size of the checkbox */
              height: 20px; /* Set the size of the checkbox */
              border: 2px solid #ccc; /* Border style for the checkbox */
              border-radius: 4px; /* Rounded corners for the checkbox */
              background-color: transparent; /* Transparent background */
              position: relative; /* Position to allow for checkmark */
            }

            .checkbox-transparent:checked {
              background-color: #4caf50; /* Green color when checked */
              border-color: #4caf50; /* Change border color when checked */
            }

            .checkbox-transparent:checked::after {
              content: "✔"; /* Checkmark symbol */
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%); /* Center the checkmark */
              color: white; /* Checkmark color */
            }
          `}</style>

          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="w-12">
                  <input
                    type="checkbox"
                    checked={selectedUsers.length === users.length}
                    onChange={handleSelectAll}
                    className="checkbox-transparent"
                  />
                </TableHead>
                <TableHead>Sr.No.</TableHead>
                <TableHead>Profile Photo</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>URN</TableHead>
                <TableHead>CRN</TableHead>
                <TableHead>Branch</TableHead>
                <TableHead>Batch</TableHead>
                <TableHead>Contact Detail</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedUsers.map((user, index) => (
                <TableRow key={user.id} className="group">
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => handleSelectUser(user.id)}
                      className="checkbox-transparent"
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    {(currentPage - 1) * parseInt(rowsPerPage) + index + 1}
                  </TableCell>
                  <TableCell>
                    <Avatar
                      className="cursor-pointer ring-offset-background transition-all hover:scale-105 hover:ring-2 hover:ring-primary hover:ring-offset-2"
                      onClick={() => setProfileModalUser(user.name)}
                    >
                      <AvatarImage src="/placeholder.svg" alt={user.name} />
                      <AvatarFallback>{user.name[0]}</AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.urn}</TableCell>
                  <TableCell>{user.crn}</TableCell>
                  <TableCell>{user.branch}</TableCell>
                  <TableCell>{user.batch}</TableCell>
                  <TableCell>{user.contact}</TableCell>
                  <TableCell className="font-medium text-primary">
                    {user.email}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="bg-transparent hover:bg-transparent"
                        onClick={() => handleDeleteUser(user)}
                      >
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
      }}
    >
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
        filteredUsers.length
      )}{" "}
      of {filteredUsers.length} entries
    </span>
  </div>
  <div className="flex gap-2">
    <Button
      variant="outline"
      size="sm"
      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
      disabled={currentPage === 1}
    >
      Previous
    </Button>
    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
      <Button
        key={page}
        variant={currentPage === page ? "default" : "outline"}
        size="sm"
        onClick={() => setCurrentPage(page)}
        className={currentPage === page ? "bg-blue-500 text-white border-0" : "border-0"}
      >
        {page}
      </Button>
    ))}
    <Button
      variant="outline"
      size="sm"
      onClick={() =>
        setCurrentPage((prev) => Math.min(totalPages, prev + 1))
      }
      disabled={currentPage === totalPages}
    >
      Next
    </Button>
  </div>
</div>
      </div>

      <Dialog
        open={!!profileModalUser}
        onOpenChange={() => setProfileModalUser(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Profile Photo
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-6 p-4">
            <div className="relative aspect-square w-full max-w-sm overflow-hidden rounded-xl ring-2 ring-muted transition-all hover:ring-4">
              <img
                src="/placeholder.svg"
                alt={`${profileModalUser}'s profile`}
                className="aspect-square object-cover transition-transform duration-300 hover:scale-105"
                width={400}
                height={400}
              />
            </div>
            <Button
              onClick={() =>
                profileModalUser && handleDownloadProfileImage(profileModalUser)
              }
              className="w-full"
            >
              <Download className="mr-2 h-4 w-4" />
              Download Profile Image
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {userToDelete?.name}? This action
              cannot be undone.
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

      <Dialog open={showBulkDeleteAlert} onOpenChange={setShowBulkDeleteAlert}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Selected Users</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedUsers.length} selected
              user(s)? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowBulkDeleteAlert(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmBulkDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
