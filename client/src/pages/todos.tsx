import { TodoList } from "@/components/todo-list";
import { useQuery } from "@tanstack/react-query";
import { type CalendarFeed } from "@shared/schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Todos() {
  const { data: feeds, isLoading: isLoadingFeeds } = useQuery<CalendarFeed[]>({
    queryKey: ["/api/feeds"],
  });

  if (isLoadingFeeds) {
    return <div>Loading feeds...</div>;
  }

  if (!feeds?.length) {
    return (
      <div className="text-center text-muted-foreground">
        No calendar feeds added yet. Add one from the home page.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Todo Lists</h1>
      
      <Tabs defaultValue={feeds[0].id.toString()}>
        <TabsList>
          {feeds.map((feed) => (
            <TabsTrigger key={feed.id} value={feed.id.toString()}>
              {feed.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {feeds.map((feed) => (
          <TabsContent key={feed.id} value={feed.id.toString()}>
            <TodoList feedId={feed.id} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
