import { Users, BarChart, Calendar } from "lucide-react";
import { StatsCard } from "@/components/DashboardComponents/StatsCard";
import { EventGraph } from "@/components/DashboardComponents/EventGraph";

const recentClubs = [
  { name: "APEX 2023", club: "GAMING CLUB", registrations: 147 },
  { name: "ANAND UTSAV", club: "GATURE COMMITTEE", registrations: 200 },
  { name: "FUN FESTA", club: "ITAN CLUB", registrations: 100 },
  {
    name: "KISME SE AKH",
    club: "90.8 FM COMMUNITY RADIO STATION",
    registrations: 204,
  },
  {
    name: "TECH OCEAN",
    club: "INDIAN SOCIETY FOR TECHNICAL EDUCATION",
    registrations: 280,
  },
];

export default function Dashboard() {
  return (
    <div className="container space-y-8 p-8">
      <div className="grid gap-4 md:grid-cols-4">
        <StatsCard
          title="New users last month"
          value="365"
          icon={Users}
          className="bg-teal-100"
        />
        <StatsCard
          title="Total users"
          value="648"
          icon={Users}
          className="bg-rose-100"
        />
        <StatsCard
          title="Total event month"
          value="7416"
          icon={Calendar}
          className="bg-sky-100"
        />
        <StatsCard
          title="Total event year"
          value="216"
          icon={BarChart}
          className="bg-amber-100"
        />
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        <div className="col-span-2">
          <EventGraph />
        </div>
        <div className="rounded-lg border bg-card p-6 shadow-md">
          {" "}
          {/* Added shadow-md */}
          <div className="text-lg font-semibold">Recent Clubs Post</div>
          <div className="mt-4 space-y-4">
            {recentClubs.map((club, index) => (
              <div key={index} className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{club.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {club.club}
                  </div>
                </div>
                <div className="text-sm">
                  {club.registrations} Registrations
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
