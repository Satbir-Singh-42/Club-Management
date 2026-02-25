import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import axios from "axios";

interface Club {
  id: number;
  name: string;
  email: string;
  dateCreated: string;
  timeCreated: string;
}

export default function RegisterClub() {
  const [showPassword, setShowPassword] = useState(false);
  const [recentClubs, setRecentClubs] = useState<Club[]>([]);
  const form = useForm();
  const { register, handleSubmit, watch, reset, formState: { errors, isSubmitting } } = form;
  const logoFile = watch("logo");

  const onSubmit = async (data: any) => {
    try {
        console.log("Request Payload:", data);
        const formData = new FormData();
        formData.append("name", data.name);
        formData.append("email", data.email);
        formData.append("password", data.password);
        formData.append("logo", data.logo[0]);
        formData.append("acronym", data.acronym);
        // Convert data to FormData
        const response = await axios.post(
            'http://localhost:8000/clubs/new',
            formData,
            {
                headers: {
                    // ❌ Remove 'Content-Type': 'application/json'
                    // ✅ Let the browser set 'Content-Type' automatically for FormData
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            }
        );
  
        console.log("Club Created Successfully", response.data);
        reset();
        getRecentClubData();
    } catch (error: any) {
        console.error("Error Creating User:", error.response?.data || error.message);
    }
  };

  useEffect(()=>{
    getRecentClubData();
  },[])

  const getRecentClubData = async() => {
    try {
      const response = await axios.get('http://localhost:8000/clubs/',
        {
          params: {
            skip: 0,
            limit: 10,
            sort_by: '-created_at',
          },
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`
          },
        }
      )
      const fetchedClubs = response.data.map((club:any) => ({
        id: club.id,
        name: club.name,
        email: club.email,
        dateCreated: club.created_at.split("T")[0],
        timeCreated: club.created_at.split("T")[1].split(".")[0],
      }))

      setRecentClubs(fetchedClubs);
    } catch (error:any) {
      console.log("Error Fetching Clubs: ", error.message)
    }
  }

  return (
    <div className="container mx-auto p-8">
      <h2 className="text-2xl font-bold mb-6 text-center">Create Club Account</h2>
      <div className="grid gap-8 md:grid-cols-2">
        {/* Club Registration Card */}
        <Card>
          <CardHeader>
            <CardTitle>Club Registration</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Club Name</FormLabel>
                      <FormControl>
                        <Input placeholder="example" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="example@gndec.ac.in" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="acronym"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Acronym</FormLabel>
                      <FormControl>
                        <Input placeholder="eg. CSI" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormItem>
                  <FormLabel>Logo</FormLabel>
                  <FormControl>
                    <Input 
                      type="file"
                      accept="image/*" // ✅ Restrict to images only
                      {...register("logo", { required: "Logo is Required" })}
                    />
                  </FormControl>
                  {errors.logo && <FormMessage >{typeof errors.logo.message==="string"? errors.logo.message:"Invalid Input"}</FormMessage>}
                </FormItem>
               
                <FormField
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter Your Password"
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-transparent hover:bg-transparent focus:bg-transparent focus:outline-none border-none hover:scale-110 transition-transform duration-200"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-5 w-5 text-gray-600" />
                            ) : (
                              <Eye className="h-5 w-5 text-gray-600" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Creating..." : "Create Club Account"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Recent Admins Table */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Added Clubs</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sr No.</TableHead>
                  <TableHead>Date Created</TableHead>
                  <TableHead>Time Created</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentClubs.map((admin, index) => (
                  <TableRow key={admin.id}>
                    <TableCell>{index+1}</TableCell>
                    <TableCell>{admin.dateCreated}</TableCell>
                    <TableCell>{admin.timeCreated}</TableCell>
                    <TableCell>{admin.name}</TableCell>
                    <TableCell>{admin.email}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}