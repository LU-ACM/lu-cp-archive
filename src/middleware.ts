import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "./lib/auth";

const PUBLIC_ROUTES = [
  "/",
  /^\/api\/auth\/.*/,
  "/user-guide",
  "/dashboard/leaderboard",
  /^\/profile\/@[^/]+\/achievements$/,
];

const isPublicRoute = (pathname: string) => {
  return PUBLIC_ROUTES.some((route) =>
    typeof route === "string" ? pathname === route : route.test(pathname)
  );
};

export async function middleware(request: NextRequest) {
  const session = await auth();
  const { pathname } = request.nextUrl;

  // Redirect logged-in users from "/" to "/dashboard"
  if (session && pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // If not public and not authenticated, redirect to "/"
  if (!isPublicRoute(pathname) && !session) {
    return NextResponse.redirect(new URL("/", request.url));
  }
}

export const config = {
  matcher: [
    // Skip static and internal Next.js files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
