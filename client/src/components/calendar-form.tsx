import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertCalendarFeedSchema } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";

export function CalendarForm() {
  const { toast } = useToast();
  const [_, setLocation] = useLocation();
  
  const form = useForm({
    resolver: zodResolver(insertCalendarFeedSchema),
    defaultValues: {
      name: "",
      url: "",
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (values: { name: string; url: string }) => {
      const res = await apiRequest("POST", "/api/feeds", values);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/feeds"] });
      toast({
        title: "Calendar feed added!",
        description: "Your events have been imported as todos.",
      });
      setLocation("/todos");
    },
    onError: () => {
      toast({
        title: "Error adding feed",
        description: "Please check the URL and try again.",
        variant: "destructive",
      });
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((data) => mutate(data))} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Calendar Name</FormLabel>
              <FormControl>
                <Input placeholder="Work Calendar" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Calendar URL</FormLabel>
              <FormControl>
                <Input 
                  placeholder="https://calendar.google.com/calendar/ical/..." 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? "Adding..." : "Add Calendar"}
        </Button>
      </form>
    </Form>
  );
}
