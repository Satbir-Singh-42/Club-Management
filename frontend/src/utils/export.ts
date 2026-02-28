import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { Student } from "@/types/student";

export const exportToExcel = (data: Student[], fileName: string) => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Students");
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
};

export const exportToPDF = (data: Student[], fileName: string) => {
  const doc = new jsPDF();
  (doc as any).autoTable({
    head: [
      [
        "Name",
        "Branch",
        "Section",
        "University Roll",
        "College Roll",
        "Batch Year",
        "Email",
        "Mentor",
        "Contact",
        "Gender",
      ],
    ],
    body: data.map((student) => [
      student.name,
      student.branch,
      student.section,
      student.universityRollNumber,
      student.collegeRollNumber,
      student.batchStartYear,
      student.personalEmail,
      student.mentorName,
      student.contact,
      student.gender,
    ]),
  });
  doc.save(`${fileName}.pdf`);
};
