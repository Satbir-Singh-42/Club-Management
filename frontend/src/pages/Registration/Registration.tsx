import Login from '@/components/Login/Login.tsx'
import SignUp from '@/components/SignUp/SignUp.tsx'
import Navbar from "@/components/Navbar/Navbar";
import "./Registration.css";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, Plus, Download } from "lucide-react";
import { exportToExcel, exportToPDF } from "@/utils/export";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Student } from "@/types/student";

interface AddStudentFormProps {
  onSubmit: (student: Student) => void;
  onCancel: () => void;
}

export function AddStudentForm({ onSubmit, onCancel }: AddStudentFormProps) {
  const [formData, setFormData] = useState<Omit<Student, "id">>({
    profileImage: "",
    name: "",
    branch: "",
    section: "",
    universityRollNumber: "",
    collegeRollNumber: "",
    batchStartYear: new Date().getFullYear(),
    personalEmail: "",
    mentorName: "",
    contact: "",
    gender: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (name: string) => (value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData as Student);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 bg-white p-6 rounded-lg shadow-md"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="branch">Branch</Label>
          <Select
            onValueChange={handleSelectChange("branch")}
            value={formData.branch}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select branch" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Computer Science">Computer Science</SelectItem>
              <SelectItem value="Electrical Engineering">
                Electrical Engineering
              </SelectItem>
              <SelectItem value="Mechanical Engineering">
                Mechanical Engineering
              </SelectItem>
              {/* Add more branches as needed */}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="section">Section</Label>
          <Input
            id="section"
            name="section"
            value={formData.section}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="universityRollNumber">University Roll Number</Label>
          <Input
            id="universityRollNumber"
            name="universityRollNumber"
            value={formData.universityRollNumber}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="collegeRollNumber">College Roll Number</Label>
          <Input
            id="collegeRollNumber"
            name="collegeRollNumber"
            value={formData.collegeRollNumber}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="batchStartYear">Batch Start Year</Label>
          <Input
            id="batchStartYear"
            name="batchStartYear"
            type="number"
            value={formData.batchStartYear}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="personalEmail">Personal Email</Label>
          <Input
            id="personalEmail"
            name="personalEmail"
            type="email"
            value={formData.personalEmail}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="mentorName">Mentor's Name</Label>
          <Input
            id="mentorName"
            name="mentorName"
            value={formData.mentorName}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="contact">Contact</Label>
          <Input
            id="contact"
            name="contact"
            value={formData.contact}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <Label htmlFor="gender">Gender</Label>
          <Select
            onValueChange={handleSelectChange("gender")}
            value={formData.gender}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Male">Male</SelectItem>
              <SelectItem value="Female">Female</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="profileImage">Profile Image URL</Label>
          <Input
            id="profileImage"
            name="profileImage"
            value={formData.profileImage}
            onChange={handleChange}
            placeholder="http://example.com/image.jpg"
          />
        </div>
      </div>
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Add Student</Button>
      </div>
    </form>
  );
}
const initialStudents: Student[] = [
  {
    id: 1,
    profileImage: "/placeholder.svg?height=40&width=40",
    name: "John Doe",
    branch: "Computer Science",
    section: "A",
    universityRollNumber: "CS2023001",
    collegeRollNumber: "CSE001",
    batchStartYear: 2023,
    personalEmail: "john.doe@example.com",
    mentorName: "Dr. Smith",
    contact: "1234567890",
    gender: "Male",
  },
  {
    id: 2,
    profileImage: "/placeholder.svg?height=40&width=40",
    name: "Jane Smith",
    branch: "Electrical Engineering",
    section: "B",
    universityRollNumber: "EE2023002",
    collegeRollNumber: "EEE002",
    batchStartYear: 2023,
    personalEmail: "jane.smith@example.com",
    mentorName: "Prof. Johnson",
    contact: "9876543210",
    gender: "Female",
  },
  {
    id: 3,
    profileImage: "/placeholder.svg?height=40&width=40",
    name: "Alex Chen",
    branch: "Mechanical Engineering",
    section: "C",
    universityRollNumber: "ME2023003",
    collegeRollNumber: "MEC003",
    batchStartYear: 2023,
    personalEmail: "alex.chen@example.com",
    mentorName: "Dr. Williams",
    contact: "5551234567",
    gender: "Other",
  },
  {
    id: 4,
    profileImage: "/placeholder.svg?height=40&width=40",
    name: "Emily Brown",
    branch: "Computer Science",
    section: "A",
    universityRollNumber: "CS2023004",
    collegeRollNumber: "CSE004",
    batchStartYear: 2023,
    personalEmail: "emily.brown@example.com",
    mentorName: "Dr. Smith",
    contact: "7778889999",
    gender: "Female",
  },
  {
    id: 5,
    profileImage: "/placeholder.svg?height=40&width=40",
    name: "Michael Wang",
    branch: "Electrical Engineering",
    section: "B",
    universityRollNumber: "EE2023005",
    collegeRollNumber: "EEE005",
    batchStartYear: 2023,
    personalEmail: "michael.wang@example.com",
    mentorName: "Prof. Johnson",
    contact: "3334445555",
    gender: "Male",
  },
  {
    id: 6,
    profileImage: "/placeholder.svg?height=40&width=40",
    name: "Sophia Patel",
    branch: "Mechanical Engineering",
    section: "C",
    universityRollNumber: "ME2023006",
    collegeRollNumber: "MEC006",
    batchStartYear: 2023,
    personalEmail: "sophia.patel@example.com",
    mentorName: "Dr. Williams",
    contact: "2223334444",
    gender: "Female",
  },
  {
    id: 7,
    profileImage: "/placeholder.svg?height=40&width=40",
    name: "David Kim",
    branch: "Computer Science",
    section: "A",
    universityRollNumber: "CS2023007",
    collegeRollNumber: "CSE007",
    batchStartYear: 2023,
    personalEmail: "david.kim@example.com",
    mentorName: "Dr. Smith",
    contact: "6667778888",
    gender: "Male",
  },
];

export default function StudentDataTable() {
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const studentsPerPage = 5;

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      setStudents(initialStudents);
      setIsLoading(false);
    }, 1500);
  }, []);

  const filteredStudents = students.filter((student) =>
    Object.values(student).some((value) =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase()),
    ),
  );

  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = filteredStudents.slice(
    indexOfFirstStudent,
    indexOfLastStudent,
  );

  const addStudent = (newStudent: Student) => {
    setStudents([...students, { ...newStudent, id: students.length + 1 }]);
    setShowAddForm(false);
  };

  const handleExport = (type: "excel" | "pdf") => {
    if (type === "excel") {
      exportToExcel(filteredStudents, "student_data");
    } else {
      exportToPDF(filteredStudents, "student_data");
    }
  };

  return (
    <div className="space-y-6 p-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl shadow-lg home-page">
      <Navbar />
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-800">Student Data</h2>
        <div className="flex space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64 pl-10 pr-4 py-2 rounded-full border-2 border-gray-200 focus:border-blue-500 transition-colors duration-300"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center space-x-2">
                <Download size={20} />
                <span>Export</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleExport("excel")}>
                Export to Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("pdf")}>
                Export to PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            onClick={() => setShowAddForm(true)}
            className="flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>Add Student</span>
          </Button>
        </div>
      </div>
      {showAddForm && (
        <AddStudentForm
          onSubmit={addStudent}
          onCancel={() => setShowAddForm(false)}
        />
      )}
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-md">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="font-bold text-gray-700">Profile</TableHead>
              <TableHead className="font-bold text-gray-700">Name</TableHead>
              <TableHead className="font-bold text-gray-700">Branch</TableHead>
              <TableHead className="font-bold text-gray-700">Section</TableHead>
              <TableHead className="font-bold text-gray-700">
                University Roll
              </TableHead>
              <TableHead className="font-bold text-gray-700">
                College Roll
              </TableHead>
              <TableHead className="font-bold text-gray-700">
                Batch Year
              </TableHead>
              <TableHead className="font-bold text-gray-700">Email</TableHead>
              <TableHead className="font-bold text-gray-700">Mentor</TableHead>
              <TableHead className="font-bold text-gray-700">Contact</TableHead>
              <TableHead className="font-bold text-gray-700">Gender</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? Array.from({ length: studentsPerPage }).map((_, index) => (
                  <TableRow key={index}>
                    {Array.from({ length: 11 }).map((_, cellIndex) => (
                      <TableCell key={cellIndex}>
                        <Skeleton className="h-8 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : currentStudents.map((student) => (
                  <TableRow
                    key={student.id}
                    className="transition-colors hover:bg-gray-50"
                  >
                    <TableCell>
                      <img
                        src={student.profileImage}
                        alt={student.name}
                        className="w-10 h-10 rounded-full"
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      {student.name}
                    </TableCell>
                    <TableCell>{student.branch}</TableCell>
                    <TableCell>{student.section}</TableCell>
                    <TableCell>{student.universityRollNumber}</TableCell>
                    <TableCell>{student.collegeRollNumber}</TableCell>
                    <TableCell>{student.batchStartYear}</TableCell>
                    <TableCell>{student.personalEmail}</TableCell>
                    <TableCell>{student.mentorName}</TableCell>
                    <TableCell>{student.contact}</TableCell>
                    <TableCell>{student.gender}</TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex justify-between items-center mt-4">
        <div>
          Showing {indexOfFirstStudent + 1} to{" "}
          {Math.min(indexOfLastStudent, filteredStudents.length)} of{" "}
          {filteredStudents.length} entries
        </div>
        <div className="space-x-2">
          <Button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <Button
            onClick={() =>
              setCurrentPage((prev) =>
                Math.min(
                  prev + 1,
                  Math.ceil(filteredStudents.length / studentsPerPage),
                ),
              )
            }
            disabled={indexOfLastStudent >= filteredStudents.length}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
