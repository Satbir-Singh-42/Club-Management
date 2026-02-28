import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "@/components/Navbar/Navbar";
import { API_BASE_URL } from "@/config/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Mail, Phone, User } from "lucide-react";
import { Link } from "react-router-dom";

type Profile = {
  id: number;
  name: string;
  email: string;
  phone?: string;
  branch?: string;
  batch?: string;
  section?: string;
  crn?: string;
  urn?: string;
  gender?: string;
};

const StudentProfile = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const me = await axios.get(`${API_BASE_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        let data = me.data as Profile;

        // Try to enrich with student detail if available
        try {
          const student = await axios.get(
            `${API_BASE_URL}/students/${me.data.id}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            },
          );
          data = { ...data, ...student.data };
        } catch {
          // best-effort; ignore if not available
        }

        setProfile(data);
      } catch (err: any) {
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const field = (label: string, value?: string | number) => (
    <div className="space-y-1">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-base font-medium text-gray-900">{value || "—"}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Student Profile
            </h1>
            <p className="text-sm text-muted-foreground">
              View your registered information. Use "Edit profile" to make
              changes.
            </p>
          </div>
          <Button asChild>
            <Link to="/studentprofile/setup">Edit profile</Link>
          </Button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="text-sm font-medium">
              Loading profile details…
            </span>
          </div>
        ) : error ? (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 rounded-md flex items-center gap-3">
            <span className="font-medium">{error}</span>
          </div>
        ) : profile ? (
          <div className="space-y-6">
            <Card className="shadow-sm border-primary/5">
              <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pb-6">
                <Avatar className="h-20 w-20 ring-4 ring-background shadow-sm">
                  <AvatarFallback className="bg-primary/10 text-primary text-2xl font-semibold">
                    {profile.name?.charAt(0).toUpperCase() || (
                      <User className="h-8 w-8" />
                    )}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2 flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <CardTitle className="text-2xl font-bold tracking-tight">
                      {profile.name}
                    </CardTitle>
                    {profile.branch && profile.batch && (
                      <Badge variant="secondary" className="w-fit">
                        {profile.branch} • Batch {profile.batch}
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5 bg-secondary/50 px-2 py-1 rounded-md">
                      <Mail className="h-4 w-4 text-primary/70" />
                      {profile.email}
                    </span>
                    {profile.phone && (
                      <span className="inline-flex items-center gap-1.5 bg-secondary/50 px-2 py-1 rounded-md">
                        <Phone className="h-4 w-4 text-primary/70" />
                        {profile.phone}
                      </span>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6 border-t bg-gray-50/50">
                <h3 className="font-semibold text-lg mb-4 text-foreground/80">
                  Academic Details
                </h3>
                <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
                  {field("Branch", profile.branch)}
                  {field("Batch", profile.batch)}
                  {field("Section", profile.section)}
                  {field("University Roll", profile.urn)}
                  {field("College Roll", profile.crn)}
                  {field("Gender", profile.gender)}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : null}
      </main>
    </div>
  );
};

export default StudentProfile;
