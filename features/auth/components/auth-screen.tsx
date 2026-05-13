"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2, Gamepad2, AlertCircle, CheckCircle2 } from "lucide-react";

import { LoginSchema, LoginInput } from "../schemas/login-schema";
import { RegisterSchema, RegisterInput } from "../schemas/register-schema";
import { loginUser } from "../actions/login";
import { registerUser } from "../actions/register";

export function AuthScreen({ initialMode = "login" }: { initialMode?: "login" | "register" }) {
    const router = useRouter();
    const [mode, setMode] = useState<"login" | "register">(initialMode);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    
    const [isPending, startTransition] = useTransition();
    const [message, setMessage] = useState<{ error?: string; success?: string }>({});

    // Forms
    const loginForm = useForm<LoginInput>({
        resolver: zodResolver(LoginSchema),
        defaultValues: { userName: "", password: "" },
    });

    const registerForm = useForm<RegisterInput>({
        resolver: zodResolver(RegisterSchema),
        defaultValues: {
            name: "",
            userName: "",
            email: "",
            password: "",
            confirmPassword: "",
            country: "",
            gender: "Male",
        },
    });

    const onLoginSubmit = (values: LoginInput) => {
        setMessage({});
        startTransition(async () => {
            const result = await loginUser(values);
            setMessage(result);

            if (result.success) {
                setTimeout(() => {
                    router.push("/");
                    router.refresh();
                }, 1000);
            }
        });
    };

    const onRegisterSubmit = (values: RegisterInput) => {
        setMessage({});
        startTransition(async () => {
            const result = await registerUser(values);
            setMessage(result);

            if (result.success) {
                setTimeout(() => {
                    setMode("login");
                    setMessage({ success: "Account created! Please log in." });
                }, 2000);
            }
        });
    };

    // Toggle Mode
    const handleModeSwitch = (newMode: "login" | "register") => {
        setMode(newMode);
        setMessage({});
        if (newMode === "login") {
            router.replace("/login");
        } else {
            router.replace("/register");
        }
    };

    return (
        <main className="min-h-screen w-full flex flex-col lg:flex-row bg-white">
            {/* Left Side (VR Image) */}
            <div className="hidden lg:flex lg:w-[45%] xl:w-[40%] relative bg-[#4f66fb] flex-col m-4 lg:m-6 xl:m-8 rounded-[40px] shadow-2xl z-10">
                {/* Topographic Background Pattern */}
                <div 
                    className="absolute inset-0 opacity-20 pointer-events-none"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                    }}
                />

                <div className="relative z-10 w-full p-12 lg:p-14 xl:p-20 pb-0">
                    <h2 className="text-4xl lg:text-5xl font-bold mb-4 tracking-tight text-white">Lorem Ipsum is simply</h2>
                    <p className="text-white/90 text-xl lg:text-2xl font-medium">Lorem Ipsum is simply</p>
                </div>

                <div className="relative flex-1 w-full mt-8 pointer-events-none">
                    {/* Stars */}
                    <div className="absolute right-[50%] top-[5%] w-16 h-16 lg:w-20 lg:h-20 xl:w-28 xl:h-28 animate-pulse z-20">
                        <Image 
                            src="/images/Burst-pucker-2.png" 
                            alt="Star Burst" 
                            fill 
                            className="object-contain select-none"
                            draggable={false}
                        />
                    </div>
                    
                    <div className="absolute right-[75%] top-[15%] w-8 h-8 lg:w-10 lg:h-10 xl:w-14 xl:h-14 animate-pulse delay-150 z-20">
                        <Image 
                            src="/images/Burst-pucker-2.png" 
                            alt="Star Burst" 
                            fill 
                            className="object-contain select-none"
                            draggable={false}
                        />
                    </div>
                    
                    <div className="absolute right-[65%] top-[25%] w-6 h-6 lg:w-8 lg:h-8 xl:w-10 xl:h-10 animate-pulse delay-300 z-20">
                        <Image 
                            src="/images/Burst-pucker-2.png" 
                            alt="Star Burst" 
                            fill 
                            className="object-contain select-none"
                            draggable={false}
                        />
                    </div>

                    {/* Man Image */}
                    <div className="absolute inset-x-0 bottom-0 h-[90%] w-[120%] -ml-[10%] z-10">
                        <Image 
                            src="/images/Man with futuristic device pointing up.png" 
                            alt="Virtual Reality Learning" 
                            fill 
                            className="object-contain object-bottom object-left drop-shadow-2xl scale-125 origin-bottom-left select-none"
                            priority
                            draggable={false}
                        />
                    </div>
                </div>
            </div>

            {/* Right Side (Forms) */}
            <div className="w-full lg:w-[55%] xl:w-[60%] flex items-center justify-center p-6 sm:p-12 lg:p-24 bg-transparent relative">
                <div className="w-full max-w-[420px] mx-auto flex flex-col">
                    {/* Logo */}
                    <div className="flex items-center justify-center gap-2 mb-12">
                        <Gamepad2 className="w-8 h-8 text-[#4f66fb]" />
                        <span className="text-2xl font-bold text-[#4f66fb]">Virtual Horizon</span>
                    </div>

                    {/* Toggle */}
                    <div className="bg-[#eef2ff] p-1.5 rounded-full flex items-center mb-8 shadow-inner border border-blue-50/50">
                        <button
                            onClick={() => handleModeSwitch("login")}
                            className={`flex-1 py-2.5 text-sm font-semibold rounded-full transition-all duration-300 ${
                                mode === "login" 
                                ? "bg-[#4f66fb] text-white shadow-md" 
                                : "text-blue-900/60 hover:text-blue-900"
                            }`}
                        >
                            Login
                        </button>
                        <button
                            onClick={() => handleModeSwitch("register")}
                            className={`flex-1 py-2.5 text-sm font-semibold rounded-full transition-all duration-300 ${
                                mode === "register" 
                                ? "bg-[#93c5fd]/50 text-[#4f66fb] shadow-md" // from image looks like a lighter blue for inactive or another color, wait image: active is blue, inactive is just text. Let's stick to standard toggle.
                                : "text-blue-900/60 hover:text-blue-900"
                            }`}
                        >
                            Register
                        </button>
                    </div>

                    {/* Description */}
                    <p className="text-slate-500 text-sm mb-8 leading-relaxed">
                        Lorem Ipsum is simply dummy text of the printing and typesetting industry.
                    </p>

                    {/* Login Form */}
                    {mode === "login" && (
                        <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-slate-700">User name</label>
                                <input
                                    {...loginForm.register("userName")}
                                    placeholder="Enter your User name"
                                    className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#4f66fb]/20 focus:border-[#4f66fb] transition-all"
                                />
                                {loginForm.formState.errors.userName && (
                                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={12}/> {loginForm.formState.errors.userName.message}</p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-slate-700">Password</label>
                                <div className="relative">
                                    <input
                                        {...loginForm.register("password")}
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Enter your Password"
                                        className="w-full h-12 pl-4 pr-12 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#4f66fb]/20 focus:border-[#4f66fb] transition-all"
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                        {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                                    </button>
                                </div>
                                {loginForm.formState.errors.password && (
                                    <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={12}/> {loginForm.formState.errors.password.message}</p>
                                )}
                            </div>

                            <div className="flex items-center justify-between text-sm">
                                <label className="flex items-center gap-2 cursor-pointer text-slate-600">
                                    <input 
                                        type="checkbox" 
                                        {...loginForm.register("rememberMe")}
                                        className="w-4 h-4 rounded border-slate-300 text-[#4f66fb] focus:ring-[#4f66fb]" 
                                    />
                                    Remember me
                                </label>
                                <Link href="#" className="text-slate-600 hover:text-[#4f66fb] transition-colors">
                                    Forgot Password ?
                                </Link>
                            </div>

                            {message.error && (
                                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 text-red-600 text-sm border border-red-100">
                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                    {message.error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isPending}
                                className="w-full h-12 bg-[#4f66fb] text-white rounded-xl font-semibold shadow-lg shadow-[#4f66fb]/30 hover:bg-[#4357d6] transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-8"
                            >
                                {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Login"}
                            </button>
                        </form>
                    )}

                    {/* Register Form */}
                    {mode === "register" && (
                        <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4 animate-in slide-in-from-left-4 fade-in duration-300">
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-slate-700">Full Name</label>
                                    <input
                                        {...registerForm.register("name")}
                                        placeholder="John Doe"
                                        className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#4f66fb]/20 focus:border-[#4f66fb] transition-all"
                                    />
                                    {registerForm.formState.errors.name && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={12}/> {registerForm.formState.errors.name.message}</p>}
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-slate-700">User name</label>
                                    <input
                                        {...registerForm.register("userName")}
                                        placeholder="johndoe123"
                                        className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#4f66fb]/20 focus:border-[#4f66fb] transition-all"
                                    />
                                    {registerForm.formState.errors.userName && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={12}/> {registerForm.formState.errors.userName.message}</p>}
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-slate-700">Email Address</label>
                                <input
                                    {...registerForm.register("email")}
                                    type="email"
                                    placeholder="john@example.com"
                                    className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#4f66fb]/20 focus:border-[#4f66fb] transition-all"
                                />
                                {registerForm.formState.errors.email && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={12}/> {registerForm.formState.errors.email.message}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-slate-700">Password</label>
                                    <div className="relative">
                                        <input
                                            {...registerForm.register("password")}
                                            type={showPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            className="w-full h-12 pl-4 pr-10 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#4f66fb]/20 focus:border-[#4f66fb] transition-all"
                                        />
                                        <button 
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                        >
                                            {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
                                        </button>
                                    </div>
                                    {registerForm.formState.errors.password && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={12}/> {registerForm.formState.errors.password.message}</p>}
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-slate-700">Confirm Password</label>
                                    <div className="relative">
                                        <input
                                            {...registerForm.register("confirmPassword")}
                                            type={showConfirmPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            className="w-full h-12 pl-4 pr-10 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#4f66fb]/20 focus:border-[#4f66fb] transition-all"
                                        />
                                        <button 
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                        >
                                            {showConfirmPassword ? <Eye size={16} /> : <EyeOff size={16} />}
                                        </button>
                                    </div>
                                    {registerForm.formState.errors.confirmPassword && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={12}/> {registerForm.formState.errors.confirmPassword.message}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-slate-700">Country</label>
                                    <select
                                        {...registerForm.register("country")}
                                        className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#4f66fb]/20 focus:border-[#4f66fb] transition-all"
                                    >
                                        <option value="">Select Country</option>
                                        <option value="Albania">Albania</option>
                                        <option value="Egypt">Egypt</option>
                                        <option value="UnitedStates">United States</option>
                                        <option value="UnitedKingdom">United Kingdom</option>
                                        <option value="Canada">Canada</option>
                                        {/* Add more as needed based on Enum */}
                                    </select>
                                    {registerForm.formState.errors.country && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={12}/> {registerForm.formState.errors.country.message}</p>}
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-slate-700">Gender</label>
                                    <select
                                        {...registerForm.register("gender")}
                                        className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#4f66fb]/20 focus:border-[#4f66fb] transition-all"
                                    >
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                    </select>
                                    {registerForm.formState.errors.gender && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={12}/> {registerForm.formState.errors.gender.message}</p>}
                                </div>
                            </div>

                            {message.error && (
                                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 text-red-600 text-sm border border-red-100 mt-4">
                                    <AlertCircle className="w-4 h-4 shrink-0" />
                                    {message.error}
                                </div>
                            )}

                            {message.success && (
                                <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 text-emerald-600 text-sm border border-emerald-100 mt-4">
                                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                                    {message.success}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isPending}
                                className="w-full h-12 bg-[#4f66fb] text-white rounded-xl font-semibold shadow-lg shadow-[#4f66fb]/30 hover:bg-[#4357d6] transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-8"
                            >
                                {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create Account"}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </main>
    );
}
