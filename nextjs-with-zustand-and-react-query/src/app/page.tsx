"use client";
import { useCounterStore } from "@/store/useStore";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";

function fetchTodo() {
  return fetch("https://jsonplaceholder.typicode.com/todos").then((res) =>
    res.json()
  );
}
export default function Home() {
  const { count, increase, decrease } = useCounterStore();
  const { data, error, isLoading } = useQuery({
    queryKey: ["todo"],
    queryFn: fetchTodo,
  });
  if (isLoading) return <div>Loading...</div>;
  if (error instanceof Error) return <div>Error: {error.message}</div>;
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1>Nextjs + Zustand + React Query</h1>
      <p>Count: {count}</p>
      <button onClick={increase}>Increase</button>
      <button onClick={decrease}>decrease</button>
      <h2>Todo</h2>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </main>
  );
}
