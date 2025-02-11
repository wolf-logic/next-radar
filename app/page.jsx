"use server";

import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { getUser } from "@/app/actions/user";
import { getUserRadars } from "@/app/actions/radar";

export default async function Page() {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  const user = await getUser(userId);
  const radars = await getUserRadars(userId);

  if (!radars || radars.length === 0) {
    return null;
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <ul className="w-full max-w-md space-y-2 px-4">
        {radars.map(radar => {
          return (
            <li key={radar.id} className="rounded-lg bg-gray-50 p-2 text-center transition-colors hover:bg-gray-100">
              <Link
                href={`/${user.slug}/${radar.slug}`}
                className="block w-full text-lg text-gray-800 hover:text-gray-600"
              >
                {radar.name}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
