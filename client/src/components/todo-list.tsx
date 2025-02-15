import { Checkbox } from "@/components/ui/checkbox";
import { useQuery, useMutation } from "@tanstack/react-query";
import { type Todo } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";

interface TodoListProps {
  feedId: number;
}

export function TodoList({ feedId }: TodoListProps) {
  const { data: todos, isLoading } = useQuery<Todo[]>({
    queryKey: ["/api/todos", feedId],
    queryFn: async ({ queryKey: [base, feedId] }) => {
      const res = await fetch(`${base}?feedId=${feedId}`);
      if (!res.ok) throw new Error("Failed to fetch todos");
      return res.json();
    },
  });

  const { mutate: toggleTodo } = useMutation({
    mutationFn: async ({ id, completed }: { id: number; completed: boolean }) => {
      const res = await apiRequest("PATCH", `/api/todos/${id}`, { completed });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/todos", feedId] });
    },
  });

  if (isLoading) {
    return <div>Loading todos...</div>;
  }

  if (!todos?.length) {
    return <div>No todos found</div>;
  }

  return (
    <div className="space-y-4">
      {todos.map((todo) => (
        <Card key={todo.id}>
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              <Checkbox
                checked={todo.completed}
                onCheckedChange={(checked) =>
                  toggleTodo({ id: todo.id, completed: checked as boolean })
                }
              />
              <div className="flex-1 space-y-1">
                <h3 className={`font-medium ${todo.completed ? "line-through text-muted-foreground" : ""}`}>
                  {todo.title}
                </h3>
                {todo.description && (
                  <p className="text-sm text-muted-foreground">{todo.description}</p>
                )}
                {todo.dueDate && (
                  <p className="text-sm text-muted-foreground">
                    Due: {format(new Date(todo.dueDate), "PPP")}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
