"use client";

import { api } from "@/trpc/client";

export default function ExampleTrpc() {
  const { data, isLoading } = api.example.hello.useQuery({ name: "World" });

  if (isLoading) {
    return <p className="text-gray-700 dark:text-gray-300">Loading…</p>;
  }

  return <p className="text-gray-900 dark:text-white">{data?.greeting}</p>;
}
