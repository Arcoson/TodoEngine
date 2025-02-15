import { CalendarForm } from "@/components/calendar-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Calendar To Todo</h1>
          <p className="text-lg text-muted-foreground">
            Transform your calendar events into manageable todo lists
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Add Calendar Feed</CardTitle>
            <CardDescription>
              Enter your calendar subscription URL to import events
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CalendarForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
