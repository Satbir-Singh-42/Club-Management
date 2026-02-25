import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import axios from 'axios';

interface User {
  id: number;
  name: string;
  email: string;
  dateCreated: string;
  timeCreated: string;
}

export default function RegisterUser() {
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const form = useForm(); // Single instance

const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = form;

const onSubmit = async (data: any) => {
  try {
      console.log("Request Payload:", data);

      // Convert data to FormData
      const response = await axios.post(
          'http://localhost:8000/students/new',
          new URLSearchParams(data).toString(),
          {
              headers: {
                  // ❌ Remove 'Content-Type': 'application/json'
                  // ✅ Let the browser set 'Content-Type' automatically for FormData
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                  "Content-Type": "application/x-www-form-urlencoded",
              },
          }
      );

      console.log("User Created Successfully", response.data);
      reset();
      fetchRecentUsers();
  } catch (error: any) {
      console.error("Error Creating User:", error.response?.data || error.message);
  }
};

  useEffect(() => {
    fetchRecentUsers();
  }, []);

  const fetchRecentUsers = async () => {
    try {
      const response = await axios.get('http://localhost:8000/students/',
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
      const fetchedUsers = response.data.map((club:any) => ({
        id: club.id,
        name: club.name,
        email: club.email,
        dateCreated: club.created_at.split("T")[0],
        timeCreated: club.created_at.split("T")[1].split(".")[0],
      }))

      setRecentUsers(fetchedUsers);
    } catch (error:any) {
      console.log("Error Fetching Clubs: ", error.message)
    }
  }

  return (
    <div className="container mx-auto p-8">
      <h2 className="text-2xl font-bold mb-6">Create User Account</h2>
      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>User Registration</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input 
                    type="text"
                    placeholder="Student Name"
                    {...register("name", {required: "Name is Required"})}
                    />
                  </FormControl>
                  {errors.name && <FormMessage>{typeof errors.name.message === "string" ? errors.name.message : "Invalid input"}</FormMessage>}
                </FormItem>
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                    type="email"
                    placeholder="Student Email"
                    {...register("email", {required: "Email is Required"})}
                    />
                  </FormControl>
                  {errors.email && <FormMessage>{typeof errors.email.message === "string" ? errors.email.message : "Invalid input"}</FormMessage>}
                </FormItem>
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                    type="password"
                    placeholder="Password"
                    {...register("password", {required: "Password is Requireed"})}
                    />
                  </FormControl>
                  {errors.password && <FormMessage>{typeof errors.password.message === "string" ? errors.password.message : "Invalid input"}</FormMessage>}
                </FormItem>
                <FormItem>
                  <FormLabel>CRN</FormLabel>
                  <FormControl>
                    <Input
                    type="number"
                    placeholder="Student CRN"
                    {...register("crn", {required: "CRN is Required"})}
                    />
                  </FormControl>
                  {errors.crn && <FormMessage>{typeof errors.crn.message === "string" ? errors.crn.message : "Invalid input"}</FormMessage>}
                </FormItem>
                <FormField
                name="urn"
                render={({field})=>(
                  <FormItem>
                    <FormLabel>URN</FormLabel>
                    <FormControl>
                      <Input placeholder="Student URN" {...field} />
                    </FormControl>
                    <FormMessage/>
                  </FormItem>
                )}
                />
                {/* Full-width blue button */}
                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Creating..." : "Create Account"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recently Added Users</CardTitle>
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
                {recentUsers.map((user, index) => (
                  <TableRow key={user.id}>
                    <TableCell>{index+1}</TableCell>
                    <TableCell>{user.dateCreated}</TableCell>
                    <TableCell>{user.timeCreated}</TableCell>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
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