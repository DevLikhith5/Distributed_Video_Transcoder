import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Mail, Lock, User, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { authClient } from "@/lib/auth-client";
import { useState } from "react";
import UploadIllustration from "@/assets/undraw_watching-reels_53wl.svg";

const SignUp = () => {
    const [fullname, setFullname] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isSocialLoading, setIsSocialLoading] = useState<"google" | "github" | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await authClient.signUp.email(
                {
                    email,
                    name: fullname,
                    password,
                    callbackURL: "http://localhost:5173/dashboard",
                },
                {
                    onSuccess: () => {
                        window.location.href = "/dashboard";
                    },
                    onError: (ctx) => {
                        alert(ctx.error.message);
                    },
                }
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleSocialSignIn = async (provider: "google" | "github") => {
        setIsSocialLoading(provider);
        try {
            await authClient.signIn.social({
                provider,
                callbackURL: "http://localhost:5173/dashboard",
            });
        } finally {
            setIsSocialLoading(null);
        }
    };

    return (
        <div className="min-h-screen flex bg-background">
            {/* Left Side - Illustration */}
            <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary/20 via-primary/10 to-background items-center justify-center p-12">
                <div className="max-w-lg space-y-6 text-center">
                    <img
                        src={UploadIllustration}
                        alt="Upload Illustration"
                        className="w-72 h-96 mx-auto drop-shadow-xl"
                    />
                    <h2 className="text-3xl font-bold tracking-tight leading-tight">
                        Transform Your Videos Effortlessly
                    </h2>
                    <p className="text-lg text-muted-foreground mt-3 max-w-sm mx-auto leading-relaxed">
                        Join thousands of creators using <span className="text-primary font-semibold">StreamForge</span>
                        to convert, edit, and optimize videos — faster than ever.
                    </p>
                </div>
            </div>

            {/* Right Side - Sign Up Form */}
            <div className="flex-1 flex items-center justify-center p-8 md:p-12 lg:p-16">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center">
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Create your account</h1>
                        <p className="text-muted-foreground mt-3 text-base">
                            Start transcoding videos in minutes
                        </p>
                    </div>

                    {/* Social Logins */}
                    <div className="space-y-4">
                        <Button
                            variant="outline"
                            className="w-full h-11 font-medium"
                            size="lg"
                            disabled={!!isSocialLoading || isLoading}
                            onClick={() => handleSocialSignIn("google")}
                        >
                            {isSocialLoading === "google" ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Connecting with Google...
                                </>
                            ) : (
                                <>
                                    <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                                        <path
                                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                            fill="#4285F4"
                                        />
                                        <path
                                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                            fill="#34A853"
                                        />
                                        <path
                                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                            fill="#FBBC05"
                                        />
                                        <path
                                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                            fill="#EA4335"
                                        />
                                    </svg>
                                    Continue with Google
                                </>
                            )}
                        </Button>

                        <Button
                            variant="outline"
                            className="w-full h-11 font-medium"
                            size="lg"
                            disabled={!!isSocialLoading || isLoading}
                            onClick={() => handleSocialSignIn("github")}
                        >
                            {isSocialLoading === "github" ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Connecting with GitHub...
                                </>
                            ) : (
                                <>
                                    <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                    </svg>
                                    Continue with GitHub
                                </>
                            )}
                        </Button>
                    </div>

                    <div className="relative">
                        <Separator />
                        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-sm text-muted-foreground font-medium">
                            Or continue with email
                        </span>
                    </div>

                    {/* Email Form */}
                    <form className="space-y-5" onSubmit={handleSubmit}>
                        <div className="space-y-2">
                            <Label htmlFor="name" className="font-medium">Full Name</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="name"
                                    type="text"
                                    placeholder="John Doe"
                                    className="pl-10 h-11"
                                    value={fullname}
                                    onChange={(e) => setFullname(e.target.value)}
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email" className="font-medium">Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    className="pl-10 h-11"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="font-medium">Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="Create a strong password"
                                    className="pl-10 h-11"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Checkbox id="terms" disabled={isLoading} />
                            <label
                                htmlFor="terms"
                                className="text-sm text-muted-foreground leading-none font-medium"
                            >
                                I agree to the{" "}
                                <a href="#" className="text-primary hover:underline underline-offset-4">
                                    Terms of Service
                                </a>{" "}
                                and{" "}
                                <a href="#" className="text-primary hover:underline underline-offset-4">
                                    Privacy Policy
                                </a>
                            </label>
                        </div>

                        <Button type="submit" className="w-full h-11 font-semibold text-base" size="lg" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Creating account...
                                </>
                            ) : (
                                "Create Account"
                            )}
                        </Button>
                    </form>

                    <p className="text-center text-sm text-muted-foreground">
                        Already have an account?{" "}
                        <Link to="/signin" className="text-primary hover:underline underline-offset-4 font-semibold">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SignUp;
