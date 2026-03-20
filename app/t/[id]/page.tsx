"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function TournamentRedirect() {
  const params = useParams();
  const router = useRouter();
  const slug = params.id as string;

  useEffect(() => {
    if (slug) router.replace(`/?slug=${slug}`);
  }, [slug, router]);

  return <main className="h-screen w-screen flex items-center justify-center bg-black text-white">Loading tournament...</main>;
}
