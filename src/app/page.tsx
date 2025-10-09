"use client";

import MaxWidthWrapper from "@/components/max-width-wrapper";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Globe from "./_components/Globe";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const handleClick = () => {
    if (session) {
      router.push("/dashboard");
    } else {
      toast.error("Please log in to continue", {
        position: "top-center",
      });
    }
  };

  return (
    <MaxWidthWrapper className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col py-5">
        <div className="flex flex-1 flex-col">
          <h1 className="relative z-10 mx-auto bg-gradient-to-b from-neutral-700 to-neutral-300 bg-clip-text text-center font-sans text-3xl font-bold leading-tight text-transparent dark:from-neutral-300 dark:to-neutral-700 sm:text-4xl md:text-6xl">
            Leading University Competitive Programming Archive
          </h1>

          <div className="full flex justify-center">
            <Globe />
          </div>
        </div>

        <div className="z-10 flex items-center justify-center gap-4">
          <Button
            variant="secondary"
            size="lg"
            className="px-6 py-8 font-mono text-xl font-bold"
            disabled={status === "loading"}
            asChild
          >
            <Link href="/user-guide">Take a tour</Link>
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="px-6 py-8 font-mono text-xl font-bold"
            onClick={handleClick}
            disabled={status === "loading"}
          >
            {status === "loading" ? "Loading..." : "Get Started"}
          </Button>
        </div>
      </div>
    </MaxWidthWrapper>
  );
}
