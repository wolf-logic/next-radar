import Head from "next/head";
import { ClerkProvider, SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/custom/app-sidebar";
import { ReactQueryProvider } from "@/components/custom/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.scss";

export const metadata = {
  title: "Build Your Own Radar",
  description: "A library that generates an interactive radar, inspired by thoughtworks.com/radar"
};

export const dynamic = "force-dynamic"; // auto | force-dynamic | error | force-static

export default function Layout({ children }) {
  return (
    <html lang="en">
      <Head>
        <Favicon />
      </Head>
      <body>
        <TooltipProvider>
          <ReactQueryProvider>
            <ClerkProvider>
              <SignedOut>
                <div className="absolute right-0 top-0 m-4">
                  <SignInButton />
                </div>
              </SignedOut>
              <SignedIn>
                <SidebarProvider>
                  <AppSidebar />
                  <div className="relative w-full">
                    <div className="absolute left-3 top-4">
                      <SidebarTrigger />
                    </div>
                    <div className="absolute right-0 top-0 m-4">
                      <UserButton />
                    </div>
                    <main className="h-full w-full">{children}</main>
                  </div>
                </SidebarProvider>
              </SignedIn>
            </ClerkProvider>
          </ReactQueryProvider>
        </TooltipProvider>
      </body>
    </html>
  );
}

function Favicon() {
  return (
    <>
      <link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96" />
      <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      <link rel="shortcut icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <meta name="apple-mobile-web-app-title" content="Radar" />
      <link rel="manifest" href="/site.webmanifest" />
    </>
  );
}
