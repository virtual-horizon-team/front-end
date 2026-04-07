import Image from "next/image";
import Link from "next/link";
import { getSession } from "@/features/auth/lib/get-session";
export default async function Hero() {
    const session = await getSession();
    return (
        <div className="flex flex-wrap items-center justify-center min-h-screen w-full  relative overflow-hidden">
            <div className=" p-10 md:p-4 md:max-w-xl">
                <h1 className="text-[40px] md:text-[56px] bg-gradient-to-r from-[#FFFFFF] to-[#999999] bg-clip-text text-transparent my-4">
                    Get ready for the new era of learning
                </h1>
                <div className="flex flex-col gap-6">
                    <p className="">
                        We combine immersive virtual reality with real-world technical training to transform how skills are built. No classrooms. No limitations. Just powerful, experience-based learning.
                    </p>
                    {session ? (
                        null
                    ) : <Link href="/register" className="text-white  px-6 py-2 text-[21px] hover:text-gray-500 cursor-pointer bg-gradient-to-r from-[#6E27E0] to-[#460F9E] rounded-xl m-2 p-2 w-48 text-center font-semibold">
                        Get Started
                    </Link>}
                </div>
            </div>
            <div className="relative flex items-center justify-center opacity-80">
                <svg className="absolute" width="1100" height="1080" viewBox="0 0 982 1080" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g opacity="0.54" filter="url(#filter0_f_80_15)" style={{ mixBlendMode: "plus-lighter" }}>
                        <path d="M1234.18 766.412L847.523 791.522C716.134 800.055 591.2 851.569 491.982 938.122L200 1192.83L461.473 663.418L347.797 84L562.87 406.296C635.953 515.816 743.032 598.255 867.599 640.904L1234.18 766.412Z" fill="#2388FF" />
                    </g>
                    <defs>
                        <filter id="filter0_f_80_15" x="0" y="-116" width="1434.18" height="1508.83" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                            <feFlood floodOpacity="0" result="BackgroundImageFix" />
                            <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
                            <feGaussianBlur stdDeviation="100" result="effect1_foregroundBlur_80_15" />
                        </filter>
                    </defs>
                </svg>
                <Image
                    src={"/VR.png"}
                    width={600}
                    height={600}
                    className="rotate-[21deg] relative md:left-1/4 md:top-[50px] z-10"
                    alt="Hero"
                    priority
                />
            </div>
        </div>
    );
}