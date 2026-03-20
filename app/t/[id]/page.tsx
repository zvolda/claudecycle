"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function TournamentRedirect() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  useEffect(() => {
    if (id) router.replace(`/?view=${id}`);
  }, [id, router]);

  return <main className="h-screen w-screen flex items-center justify-center bg-black text-white">Loading tournament...</main>;
}
