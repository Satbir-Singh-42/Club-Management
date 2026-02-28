import Navbar from "@/components/Navbar/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Plus, FileText, LayoutDashboard, ArrowLeft } from "lucide-react";

const CreateEventPost = () => {
  return (
    <div className="min-h-screen bg-gray-50/50">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 py-10 space-y-8">
        <div className="space-y-2">
          <Button
            asChild
            variant="ghost"
            className="mb-2 -ml-4 text-muted-foreground hover:text-foreground">
            <Link to="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                Create Event
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Draft new events or publish them directly for your club.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Create New Card */}
          <Card className="shadow-sm hover:shadow-md transition-shadow border-primary/10">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Plus className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-xl">Start from Scratch</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Create a brand new event, fill in details like date, time,
                venue, and upload promotional banners.
              </p>
              <Button asChild className="w-full">
                <Link to="/event-form">Create New Event</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Drafts Card */}
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-secondary-foreground" />
              </div>
              <CardTitle className="text-xl">Continue Draft</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Pick up where you left off. Review and publish events you've
                started working on previously.
              </p>
              <Button asChild variant="outline" className="w-full">
                <Link to="/EventDraft">View Saved Drafts</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default CreateEventPost;
