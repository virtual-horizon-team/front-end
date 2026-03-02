import { LoginForm } from "@/features/auth/components/login-form";

export default function LoginPage() {
    return (
        <main className="min-h-screen w-full flex items-center justify-center bg-[#050510] relative overflow-hidden">
            <div className="relative flex items-center justify-center opacity-80">
                <svg className="absolute left-0 md:left-10" width="1100" height="1080" viewBox="0 0 982 1080" fill="none" xmlns="http://www.w3.org/2000/svg">
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
                <LoginForm />
            </div>
        </main>
    );
}
