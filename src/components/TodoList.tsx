"use client";
import { useState } from "react";
import { useLocalStorage } from "@/components/hooks/useLocalStorage";
import { Plus, Check, X, Edit2 } from "lucide-react";
import { format } from "date-fns";

type TodoItem = {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
  date: string;
};

interface TodoListProps {
  selectedDate: Date;
}

export function TodoList({ selectedDate }: TodoListProps) {
  const [allTodos, setAllTodos] = useLocalStorage<TodoItem[]>("dashboard-todos", []);
  const dateKey = format(selectedDate, "yyyy-MM-dd");
  
  // Filter todos for the selected date
  const todos = allTodos.filter(todo => todo.date === dateKey);
  const [newTodoText, setNewTodoText] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  const addTodo = () => {
    if (newTodoText.trim()) {
      const newTodo: TodoItem = {
        id: Date.now().toString(),
        text: newTodoText.trim(),
        completed: false,
        createdAt: new Date().toISOString(),
        date: dateKey,
      };
      setAllTodos([...allTodos, newTodo]);
      setNewTodoText("");
    }
  };

  const toggleComplete = (id: string) => {
    setAllTodos(allTodos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id: string) => {
    setAllTodos(allTodos.filter(todo => todo.id !== id));
  };

  const startEdit = (todo: TodoItem) => {
    setEditingId(todo.id);
    setEditText(todo.text);
  };

  const saveEdit = () => {
    if (editText.trim() && editingId) {
      setAllTodos(allTodos.map(todo => 
        todo.id === editingId ? { ...todo, text: editText.trim() } : todo
      ));
      setEditingId(null);
      setEditText("");
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText("");
  };

  const handleKeyPress = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === "Enter") {
      action();
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <Check className="w-5 h-5 text-green-400" />
        My To-Do List
      </h2>

      {/* Add new todo */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={newTodoText}
          onChange={(e) => setNewTodoText(e.target.value)}
          onKeyPress={(e) => handleKeyPress(e, addTodo)}
          placeholder="Add a new task..."
          className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={addTodo}
          disabled={!newTodoText.trim()}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center gap-1"
        >
          <Plus className="w-4 h-4" />
          Add
        </button>
      </div>

      {/* Todo list */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {todos.length === 0 ? (
          <p className="text-white/60 text-center py-4">No tasks yet. Add one above!</p>
        ) : (
          todos.map((todo) => (
            <div
              key={todo.id}
              className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                todo.completed
                  ? "bg-green-500/10 border-green-500/30"
                  : "bg-white/5 border-white/10 hover:bg-white/10"
              }`}
            >
              {/* Checkbox */}
              <button
                onClick={() => toggleComplete(todo.id)}
                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                  todo.completed
                    ? "bg-green-500 border-green-500 text-white"
                    : "border-white/40 hover:border-white/60"
                }`}
              >
                {todo.completed && <Check className="w-3 h-3" />}
              </button>

              {/* Todo text */}
              <div className="flex-1">
                {editingId === todo.id ? (
                  <input
                    type="text"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onKeyPress={(e) => handleKeyPress(e, saveEdit)}
                    onBlur={saveEdit}
                    className="w-full px-2 py-1 bg-white/10 border border-white/20 rounded text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    autoFocus
                  />
                ) : (
                  <span
                    className={`${
                      todo.completed
                        ? "line-through text-white/60"
                        : "text-white"
                    }`}
                  >
                    {todo.text}
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1">
                {editingId === todo.id ? (
                  <button
                    onClick={cancelEdit}
                    className="p-1 hover:bg-white/10 rounded text-white/60 hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => startEdit(todo)}
                      className="p-1 hover:bg-white/10 rounded text-white/60 hover:text-white transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteTodo(todo.id)}
                      className="p-1 hover:bg-white/10 rounded text-white/60 hover:text-red-400 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Summary */}
      {todos.length > 0 && (
        <div className="mt-4 pt-4 border-t border-white/10 text-sm text-white/60">
          {todos.filter(t => t.completed).length} of {todos.length} tasks completed
        </div>
      )}
    </div>
  );
}