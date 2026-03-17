import { Copyright } from "lucide-react";
import Link from "next/link";
import React from "react";

export default function Footer() {
  return (
    <div className="bottom-0 w-full border-t border-neutral-200 bg-transparent dark:border-white/[0.1]">
      <div className="flex items-center justify-center font-mono">
        <Link
          href="https://github.com/Iftekhar-Ifat/lu-cp-archive"
          target="_blank"
          rel="noopener noreferrer"
        >
          <div className="flex items-center">
            <Copyright size={20} className="m-1" />
            LU-ACM
          </div>
        </Link>
      </div>
    </div>
  );
}
