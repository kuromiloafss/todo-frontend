export interface Todo {
  id: number | string;
  text: string;
  completed: boolean;
}

export async function getTodos(): Promise<Todo[]> {
  // Simulasi data dari database / server
  return [
    { id: 1, text: 'Belajar Next.js Server Components', completed: true },
    { id: 2, text: 'Membuat fitur Caching LocalStorage', completed: false },
  ];
}