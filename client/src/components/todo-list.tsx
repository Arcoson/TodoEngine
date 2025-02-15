import { Checkbox } from "@/components/ui/checkbox";
import { useQuery, useMutation } from "@tanstack/react-query";
import { type Todo, Priority } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowUp, ArrowRight, ArrowDown } from "lucide-react";

interface TodoListProps {
  feedId: number;
}

const priorityIcons = {
  high: <ArrowUp className="h-4 w-4 text-red-500" />,
  medium: <ArrowRight className="h-4 w-4 text-yellow-500" />,
  low: <ArrowDown className="h-4 w-4 text-green-500" />,
};

export function TodoList({ feedId }: TodoListProps) {
  const { data: todos, isLoading } = useQuery<Todo[]>({
    queryKey: ["/api/todos", feedId],
    queryFn: async ({ queryKey: [base, feedId] }) => {
      const res = await fetch(`${base}?feedId=${feedId}`);
      if (!res.ok) throw new Error("Failed to fetch todos");
      return res.json();
    },
  });

  const { mutate: updateTodo } = useMutation({
    mutationFn: async ({ id, ...data }: { id: number } & Partial<Todo>) => {
      const res = await apiRequest("PATCH", `/api/todos/${id}`, data);
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

  // Sort todos by priority (high -> medium -> low) and then by due date
  const sortedTodos = [...todos].sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    const priorityDiff = priorityOrder[a.priority as keyof typeof priorityOrder] - priorityOrder[b.priority as keyof typeof priorityOrder];
    if (priorityDiff !== 0) return priorityDiff;
    return new Date(a.dueDate || 0).getTime() - new Date(b.dueDate || 0).getTime();
  });

  return (
    <div className="space-y-4">
      {sortedTodos.map((todo) => (
        <Card key={todo.id}>
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              <Checkbox
                checked={todo.completed}
                onCheckedChange={(checked) =>
                  updateTodo({ id: todo.id, completed: checked as boolean })
                }
              />
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  {priorityIcons[todo.priority as keyof typeof priorityIcons]}
                  <h3 className={`font-medium ${todo.completed ? "line-through text-muted-foreground" : ""}`}>
                    {todo.title}
                  </h3>
                </div>
                {todo.description && (
                  <p className="text-sm text-muted-foreground">{todo.description}</p>
                )}
                {todo.dueDate && (
                  <p className="text-sm text-muted-foreground">
                    Due: {format(new Date(todo.dueDate), "PPP")}
                  </p>
                )}
              </div>
              <Select
                defaultValue={todo.priority}
                onValueChange={(value) => updateTodo({ id: todo.id, priority: value })}
              >
                <SelectTrigger className="w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}