import { SignInButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export function LandingPage() {
  return (
    <div className="grid min-h-full grid-cols-1 grid-rows-[1fr,auto,1fr] bg-white lg:grid-cols-[max(50%,36rem),1fr]">
      <header className="mx-auto w-full max-w-7xl px-6 pt-6 sm:pt-10 lg:col-span-2 lg:col-start-1 lg:row-start-1 lg:px-8">
        <a href="#">
          <span className="sr-only">Radar</span>
          <img className="h-10 w-auto sm:h-12" src="/images/logo.svg" alt="" />
        </a>
      </header>
      <main className="mx-auto w-full max-w-7xl px-6 py-24 sm:py-32 lg:col-span-2 lg:col-start-1 lg:row-start-2 lg:px-8">
        <div className="max-w-lg">
          {/*<p className="text-base font-semibold leading-8 text-blue-600">Wolf Logic</p>*/}
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">Radar</h1>
          <p className="mt-6 text-base leading-7 text-gray-600">An app for building your own radar charts</p>
          <div className="mt-10 h-2">
            <SignInButton>
              <Button color="blue" className="cursor-pointer">
                Sign In
              </Button>
            </SignInButton>
          </div>
        </div>
      </main>
      <footer className="self-end lg:col-span-2 lg:col-start-1 lg:row-start-3">
        <div className="border-t border-gray-100 bg-gray-50 py-10">
          <nav className="mx-auto flex w-full max-w-7xl items-center gap-x-4 px-6 text-sm leading-7 text-gray-600 lg:px-8">
            <a href="https://wolflogic.co.uk/">Contact Wolf Logic</a>
          </nav>
        </div>
      </footer>
      <div className="hidden lg:relative lg:col-start-2 lg:row-start-1 lg:row-end-4 lg:block">
        <img
          src="https://images.unsplash.com/photo-1572224104782-91a08d296390?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>
    </div>
  );
}
