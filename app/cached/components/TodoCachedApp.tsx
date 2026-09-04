'use client';

import { useState, useEffect } from 'react';

export interface Todo {
  id: number | string;
  text: string;
  completed: boolean;
}

interface TodoCachedAppProps {
  initialTodos: Todo[];
}

const STORAGE_KEY = 'TODO_LIST_CACHE';

export default function TodoCachedApp({ initialTodos }: TodoCachedAppProps) {
  const [todos, setTodos] = useState<Todo[]>(initialTodos);
  const [input, setInput] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  // Load dari localStorage setelah komponen mounted di client (Mencegah Hydration Error)
  useEffect(() => {
    setIsMounted(true);
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setTodos(JSON.parse(saved));
      } catch (e) {
        console.error('Gagal membaca localStorage:', e);
      }
    }
  }, []);

  // Simpan ke localStorage setiap ada perubahan data
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    }
  }, [todos, isMounted]);

  // Sinkronisasi otomatis antar-tab browser
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        setTodos(JSON.parse(e.newValue));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const addTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newTodo: Todo = {
      id: Date.now(),
      text: input.trim(),
      completed: false,
    };

    setTodos((prev) => [...prev, newTodo]);
    setInput('');
  };

  const toggleTodo = (id: number | string) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const deleteTodo = (id: number | string) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  };

  const resetToInitial = () => {
    setTodos(initialTodos);
    localStorage.removeItem(STORAGE_KEY);
  };

  if (!isMounted) return null;

  return (
    <div className="space-y-4">
      <form onSubmit={addTodo} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Tambahkan tugas baru..."
          className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
        >
          Tambah
        </button>
      </form>

      {/* Indikator Caching & Tombol Reset */}
      <div className="flex justify-between items-center text-xs text-gray-500">
        <span className="text-emerald-600 flex items-center gap-1 font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
          Caching aktif (localStorage: {STORAGE_KEY})
        </span>
        <button
          type="button"
          onClick={resetToInitial}
          className="text-gray-400 hover:text-gray-600 transition"
        >
          Reset ke Data Awal
        </button>
      </div>

      {/* Sub-header & Counter */}
      <div className="flex justify-between items-center mt-4">
        <h3 className="font-bold text-gray-800 text-sm">Daftar Tugas</h3>
        <span className="bg-gray-100 text-gray-600 text-xs font-semibold px-2.5 py-0.5 rounded-full border">
          {todos.length} item
        </span>
      </div>

      <ul className="space-y-2">
        {todos.map((todo) => (
          <li
            key={todo.id}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
          >
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => toggleTodo(todo.id)}
                className="w-5 h-5 accent-blue-600"
              />
              <span className={todo.completed ? 'line-through text-gray-400' : ''}>
                {todo.text}
              </span>
            </label>

            <div className="flex items-center gap-2">
              <button
                type="button"
                className="text-xs bg-blue-100 text-blue-600 px-3 py-1 rounded hover:bg-blue-200"
              >
                Detail &rarr;
              </button>
              <button
                type="button"
                onClick={() => deleteTodo(todo.id)}
                className="text-xs bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
              >
                Hapus
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}