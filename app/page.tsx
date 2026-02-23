import Link from "next/link";
import { getSession } from "@/features/auth/lib/get-session";
import { logoutUser } from "@/features/auth/actions/logout";

export default async function Home() {
  const session = await getSession();

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#050510] relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-600/10 blur-[120px] rounded-full" />
      <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent my-4">
        Virtual Horizon
      </h1>
      {!session ?
        <div className="flex flex-col">
          <Link href="/login" className="text-blue-400 hover:text-blue-500 cursor-pointer bg-white/8 rounded-full m-2 p-2 w-48 text-center">Login</Link>
          <Link href="/register" className="text-blue-400 hover:text-blue-500 cursor-pointer bg-white/8 rounded-full m-2 p-2 w-48 text-center">Register</Link>
        </div>
        : <div className="flex flex-col justify-center items-center bg-white/8 rounded-md m-2 p-2 text-center">
          <p className="text-blue-400 hover:text-blue-500 m-2 p-2 text-center">{session.userName}</p>
          <p className="text-blue-400 hover:text-blue-500 m-2 p-2 text-center">{session.email}</p>
          <form action={logoutUser}>
            <button className="text-blue-400 hover:text-blue-500 cursor-pointer bg-white/8 rounded-full m-2 p-2 w-48 text-center">Logout</button>
          </form>
        </div>
      }

    </div>
  );
}
