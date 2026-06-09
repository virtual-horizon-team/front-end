"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
    Eye, 
    EyeOff, 
    Loader2, 
    AlertCircle,
    Gamepad2, 
    CheckCircle2, 
    Mail, 
    Lock, 
    User, 
    Globe, 
    ChevronDown 
} from "lucide-react";

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
        <main className="relative w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 via-pink-50 to-rose-100 select-none overflow-x-hidden">
            {/* Background Image: Covers all page */}
            <div className="absolute inset-0 w-full h-full z-0 select-none pointer-events-none">
                <Image
                    src="/images/login-bg2.png"
                    alt="Virtual Horizon Background"
                    fill
                    priority
                    className="object-cover object-center"
                    sizes="100vw"
                />
            </div>

            {/* Clickable Logo: Absolute position at the top-left of the page */}
            <div className="absolute top-6 left-6 sm:top-8 sm:left-10 xl:top-12 xl:left-16 z-20">
                <Link href="/" className="flex items-center gap-2.5 group cursor-pointer">
                    <Gamepad2 className="w-8 h-8 text-brand-primary group-hover:scale-105 transition-transform duration-200" />
                    <span className="text-2xl font-bold text-brand-navy tracking-tight group-hover:text-brand-muted transition-colors duration-200">
                        Virtual Horizon
                    </span>
                </Link>
            </div>

            {/* Split Screen Container: Covers 100% viewport width, no outer margins or bounds */}
            <div className="w-full min-h-screen relative z-10 flex flex-col lg:flex-row items-stretch">
                
                {/* Left Section - Branding Text Group (Positioned at the top-left area above the fingers) */}
                <div className="w-full lg:w-1/2 flex flex-col justify-start items-center p-8 sm:p-12 xl:p-20 text-white min-h-[460px] lg:min-h-0">
                    
                    {/* Top Group - Heading and Paragraph positioned below the absolute logo */}
                    <div className="w-full max-w-[440px] space-y-6 mt-20 sm:mt-24 lg:mt-28">
                        {/* Heading & Paragraph Group */}
                        <div className="space-y-4">
                            <h1 className="font-epilogue leading-[1.1] text-brand-navy tracking-tight animate-in slide-in-from-left duration-500">
                                <span className="text-3xl lg:text-[36px] font-semibold text-brand-text block mb-1">Step Into a</span>
                                <span className="text-5xl lg:text-[58px] font-bold text-brand-primary block">New Reality</span>
                            </h1>
                            <p className="text-brand-muted text-sm sm:text-base font-normal leading-relaxed animate-in slide-in-from-left duration-700">
                                Experience immersive learning through virtual worlds and interactive courses.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Section - Authentic Floating White Card (Centered inside the right 50% viewport) */}
                <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-10 lg:p-12">
                    <div className="w-full max-w-[540px] bg-white/80 backdrop-blur-xl rounded-[28px] shadow-[0_20px_60px_rgba(15,23,42,0.12)] border border-white/40 p-10 sm:p-14 flex flex-col animate-in slide-in-from-right-5 fade-in duration-700">
                        
                        {/* Form Header */}
                        <div className="text-center mb-6 mt-2 lg:mt-0">
                            <h2 className="text-3xl font-bold font-epilogue text-brand-text">
                                {mode === "login" ? "Welcome back" : "Create Account"}
                            </h2>
                            <p className="text-sm text-brand-muted mt-1.5">
                                {mode === "login" 
                                    ? "Sign in to continue your learning journey" 
                                    : "Sign up to start your learning journey"}
                            </p>
                        </div>

                        {/* Mode Switch Tabs */}
                        <div className="flex border-b border-brand-border mb-6 relative">
                            <button
                                type="button"
                                onClick={() => handleModeSwitch("login")}
                                className={`flex-1 pb-3 text-sm font-semibold transition-colors relative cursor-pointer ${
                                    mode === "login"
                                        ? "text-brand-primary font-bold"
                                        : "text-brand-muted hover:text-brand-text"
                                }`}
                            >
                                Sign In
                                {mode === "login" && (
                                    <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-brand-primary rounded-full shadow-[0_1px_6px_rgba(163,0,20,0.4)]" />
                                )}
                            </button>
                            <button
                                type="button"
                                onClick={() => handleModeSwitch("register")}
                                className={`flex-1 pb-3 text-sm font-semibold transition-colors relative cursor-pointer ${
                                    mode === "register"
                                        ? "text-brand-primary font-bold"
                                        : "text-brand-muted hover:text-brand-text"
                                }`}
                            >
                                Create Account
                                {mode === "register" && (
                                    <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-brand-primary rounded-full shadow-[0_1px_6px_rgba(163,0,20,0.4)]" />
                                )}
                            </button>
                        </div>

                        {/* Login Form */}
                        {mode === "login" && (
                            <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4 animate-in fade-in duration-200">
                                {/* Social Login Buttons */}
                                <div className="mb-4">
                                    <button
                                        type="button"
                                        className="flex w-full h-[46px] items-center justify-center gap-2 rounded-[12px] border border-brand-border bg-white px-3 text-[11px] sm:text-xs font-semibold text-brand-text shadow-[0_2px_8px_rgba(15,23,42,0.03)] hover:bg-brand-soft hover:border-brand-border hover:shadow-[0_4px_12px_rgba(15,23,42,0.06)] hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 cursor-pointer"
                                    >
                                        <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                                        </svg>
                                        <span>Continue with Google</span>
                                    </button>
                                </div>

                                {/* Divider */}
                                <div className="relative flex items-center justify-center my-5">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full h-px bg-gradient-to-r from-transparent via-brand-border to-transparent"></div>
                                    </div>
                                    <span className="relative bg-white/80 backdrop-blur-sm px-4 text-[10px] font-bold text-brand-muted uppercase tracking-wider">
                                        or continue with email
                                    </span>
                                </div>

                                {/* Username Input */}
                                <div className="space-y-1">
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-brand-muted">
                                            <User className="w-5 h-5" />
                                        </div>
                                        <input
                                            {...loginForm.register("userName")}
                                            placeholder="Enter your username"
                                            className="w-full h-[52px] pl-12 pr-4 rounded-[14px] border border-brand-border bg-brand-soft/50 hover:bg-brand-soft/80 focus:bg-white text-sm text-brand-text placeholder-brand-muted focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 transition-all duration-200"
                                        />
                                    </div>
                                    {loginForm.formState.errors.userName && (
                                        <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                                            <AlertCircle className="w-3.5 h-3.5" />
                                            <span>{loginForm.formState.errors.userName.message}</span>
                                        </p>
                                    )}
                                </div>

                                {/* Password Input */}
                                <div className="space-y-1">
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-brand-muted">
                                            <Lock className="w-5 h-5" />
                                        </div>
                                        <input
                                            {...loginForm.register("password")}
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Enter your password"
                                            className="w-full h-[52px] pl-12 pr-12 rounded-[14px] border border-brand-border bg-brand-soft/50 hover:bg-brand-soft/80 focus:bg-white text-sm text-brand-text placeholder-brand-muted focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 transition-all duration-200"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-muted hover:text-brand-text transition-colors cursor-pointer"
                                        >
                                            {showPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                                        </button>
                                    </div>
                                    {loginForm.formState.errors.password && (
                                        <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                                            <AlertCircle className="w-3.5 h-3.5" />
                                            <span>{loginForm.formState.errors.password.message}</span>
                                        </p>
                                    )}
                                </div>

                                {/* Checkbox and Forgot Password Link */}
                                <div className="flex items-center justify-between text-xs sm:text-sm pt-1">
                                    <label className="flex items-center gap-2 cursor-pointer text-brand-muted font-medium select-none">
                                        <input
                                            type="checkbox"
                                            {...loginForm.register("rememberMe")}
                                            className="w-4 h-4 rounded border-brand-border text-brand-primary focus:ring-brand-primary/20 accent-brand-primary cursor-pointer"
                                        />
                                        <span>Remember me</span>
                                    </label>
                                    <Link href="#" className="text-brand-primary hover:text-brand-hover font-semibold transition-colors">
                                        Forgot password?
                                    </Link>
                                </div>

                                {/* Form error response */}
                                {message.error && (
                                    <div className="flex items-center gap-2 p-3.5 rounded-[12px] bg-red-50 text-red-600 text-xs sm:text-sm border border-red-100">
                                        <AlertCircle className="w-4 h-4 shrink-0" />
                                        <span>{message.error}</span>
                                    </div>
                                )}

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={isPending}
                                    className="w-full h-[52px] bg-brand-primary hover:bg-brand-hover text-white rounded-[14px] font-bold text-sm shadow-lg shadow-brand-primary/25 hover:shadow-xl hover:shadow-brand-primary/35 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4 cursor-pointer"
                                >
                                    {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In"}
                                </button>
                            </form>
                        )}

                        {/* Register Form */}
                        {mode === "register" && (
                            <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-3.5 animate-in fade-in duration-200">
                                {/* Name and Username Fields */}
                                <div className="space-y-1">
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-brand-muted">
                                            <User className="w-4.5 h-4.5" />
                                        </div>
                                        <input
                                            {...registerForm.register("name")}
                                            placeholder="Full Name"
                                            className="w-full h-[48px] pl-11 pr-3 rounded-[12px] border border-brand-border bg-brand-soft/50 hover:bg-brand-soft/80 focus:bg-white text-xs text-brand-text placeholder-brand-muted focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 transition-all duration-200"
                                        />
                                    </div>
                                    {registerForm.formState.errors.name && (
                                        <p className="text-[10px] text-red-500 mt-0.5 flex items-center gap-0.5">
                                            <AlertCircle className="w-3.5 h-3.5" />
                                            <span>{registerForm.formState.errors.name.message}</span>
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-brand-muted">
                                            <User className="w-4.5 h-4.5" />
                                        </div>
                                        <input
                                            {...registerForm.register("userName")}
                                            placeholder="Username"
                                            className="w-full h-[48px] pl-11 pr-3 rounded-[12px] border border-brand-border bg-brand-soft/50 hover:bg-brand-soft/80 focus:bg-white text-xs text-brand-text placeholder-brand-muted focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 transition-all duration-200"
                                        />
                                    </div>
                                    {registerForm.formState.errors.userName && (
                                        <p className="text-[10px] text-red-500 mt-0.5 flex items-center gap-0.5">
                                            <AlertCircle className="w-3 h-3" />
                                            <span>{registerForm.formState.errors.userName.message}</span>
                                        </p>
                                    )}
                                </div>

                                {/* Email Address Field */}
                                <div className="space-y-1">
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-brand-muted">
                                            <Mail className="w-4.5 h-4.5" />
                                        </div>
                                        <input
                                            {...registerForm.register("email")}
                                            type="email"
                                            placeholder="Email Address"
                                            className="w-full h-[48px] pl-11 pr-3 rounded-[12px] border border-brand-border bg-brand-soft/50 hover:bg-brand-soft/80 focus:bg-white text-xs text-brand-text placeholder-brand-muted focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 transition-all duration-200"
                                        />
                                    </div>
                                    {registerForm.formState.errors.email && (
                                        <p className="text-[10px] text-red-500 mt-0.5 flex items-center gap-0.5">
                                            <AlertCircle className="w-3.5 h-3.5" />
                                            <span>{registerForm.formState.errors.email.message}</span>
                                        </p>
                                    )}
                                </div>

                                {/* Password and Confirm Password Fields */}
                                <div className="grid grid-cols-2 gap-3.5">
                                    <div className="space-y-1">
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-brand-muted">
                                                <Lock className="w-4.5 h-4.5" />
                                            </div>
                                            <input
                                                {...registerForm.register("password")}
                                                type={showPassword ? "text" : "password"}
                                                placeholder="Password"
                                                className="w-full h-[48px] pl-10 pr-9 rounded-[12px] border border-brand-border bg-brand-soft/50 hover:bg-brand-soft/80 focus:bg-white text-xs text-brand-text placeholder-brand-muted focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 transition-all duration-200"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted hover:text-brand-text transition-colors cursor-pointer"
                                            >
                                                {showPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                            </button>
                                        </div>
                                        {registerForm.formState.errors.password && (
                                            <p className="text-[10px] text-red-500 mt-0.5 flex items-center gap-0.5">
                                                <AlertCircle className="w-3 h-3" />
                                                <span>{registerForm.formState.errors.password.message}</span>
                                            </p>
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-brand-muted">
                                                <Lock className="w-4.5 h-4.5" />
                                            </div>
                                            <input
                                                {...registerForm.register("confirmPassword")}
                                                type={showConfirmPassword ? "text" : "password"}
                                                placeholder="Confirm"
                                                className="w-full h-[48px] pl-10 pr-9 rounded-[12px] border border-brand-border bg-brand-soft/50 hover:bg-brand-soft/80 focus:bg-white text-xs text-brand-text placeholder-brand-muted focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 transition-all duration-200"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted hover:text-brand-text transition-colors cursor-pointer"
                                            >
                                                {showConfirmPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                            </button>
                                        </div>
                                        {registerForm.formState.errors.confirmPassword && (
                                            <p className="text-[10px] text-red-500 mt-0.5 flex items-center gap-0.5">
                                                <AlertCircle className="w-3.5 h-3.5" />
                                                <span>{registerForm.formState.errors.confirmPassword.message}</span>
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Country and Gender Fields */}
                                <div className="grid grid-cols-2 gap-3.5">
                                    <div className="space-y-1">
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-brand-muted">
                                                <Globe className="w-4.5 h-4.5" />
                                            </div>
                                            <select
                                                {...registerForm.register("country")}
                                                className="w-full h-[48px] pl-10 pr-8 rounded-[12px] border border-brand-border bg-brand-soft/50 hover:bg-brand-soft/80 focus:bg-white text-xs text-brand-text placeholder-brand-muted focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 transition-all appearance-none cursor-pointer duration-200"
                                            >
                                                <option value="">Country</option>
                                                <option value="Albania">Albania</option>
                                                <option value="Egypt">Egypt</option>
                                                <option value="UnitedStates">United States</option>
                                                <option value="UnitedKingdom">United Kingdom</option>
                                                <option value="Canada">Canada</option>
                                            </select>
                                            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-brand-muted">
                                                <ChevronDown className="w-3.5 h-3.5" />
                                            </div>
                                        </div>
                                        {registerForm.formState.errors.country && (
                                            <p className="text-[10px] text-red-500 mt-0.5 flex items-center gap-0.5">
                                                <AlertCircle className="w-3.5 h-3.5" />
                                                <span>{registerForm.formState.errors.country.message}</span>
                                            </p>
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-brand-muted">
                                                <User className="w-4.5 h-4.5" />
                                            </div>
                                            <select
                                                {...registerForm.register("gender")}
                                                className="w-full h-[48px] pl-10 pr-8 rounded-[12px] border border-brand-border bg-brand-soft/50 hover:bg-brand-soft/80 focus:bg-white text-xs text-brand-text placeholder-brand-muted focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 transition-all appearance-none cursor-pointer duration-200"
                                            >
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                            </select>
                                            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-brand-muted">
                                                <ChevronDown className="w-3.5 h-3.5" />
                                            </div>
                                        </div>
                                        {registerForm.formState.errors.gender && (
                                            <p className="text-[10px] text-red-500 mt-0.5 flex items-center gap-0.5">
                                                <AlertCircle className="w-3.5 h-3.5" />
                                                <span>{registerForm.formState.errors.gender.message}</span>
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Form response messages */}
                                {message.error && (
                                    <div className="flex items-center gap-2 p-3 rounded-[12px] bg-red-50 text-red-600 text-xs border border-red-100">
                                        <AlertCircle className="w-4 h-4 shrink-0" />
                                        <span>{message.error}</span>
                                    </div>
                                )}
                                {message.success && (
                                    <div className="flex items-center gap-2 p-3 rounded-[12px] bg-emerald-50 text-emerald-600 text-xs border border-emerald-100">
                                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                                        <span>{message.success}</span>
                                    </div>
                                )}

                                {/* Submit button */}
                                <button
                                    type="submit"
                                    disabled={isPending}
                                    className="w-full h-[52px] bg-brand-primary hover:bg-brand-hover text-white rounded-[14px] font-bold text-sm shadow-lg shadow-brand-primary/25 hover:shadow-xl hover:shadow-brand-primary/35 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-5 cursor-pointer"
                                >
                                    {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create Account"}
                                </button>
                            </form>
                        )}

                        {/* Footer Link */}
                        <div className="text-center mt-6 text-sm text-brand-muted font-medium">
                            {mode === "login" ? (
                                <>
                                    Don&apos;t have an account?{" "}
                                    <button
                                        type="button"
                                        onClick={() => handleModeSwitch("register")}
                                        className="text-brand-primary hover:text-brand-hover font-bold hover:underline cursor-pointer"
                                    >
                                        Create Account
                                    </button>
                                </>
                            ) : (
                                <>
                                    Already have an account?{" "}
                                    <button
                                        type="button"
                                        onClick={() => handleModeSwitch("login")}
                                        className="text-brand-primary hover:text-brand-hover font-bold hover:underline cursor-pointer"
                                    >
                                        Sign In
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
