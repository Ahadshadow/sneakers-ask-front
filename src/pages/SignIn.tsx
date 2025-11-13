import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Form validation schema
const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type SignInFormData = z.infer<typeof signInSchema>;

const SignIn = () => {

  const [step, setStep] = useState<"login" | "otp">("login");
  const [loginEmail, setLoginEmail] = useState<string>("");
  const [otp, setOtp] = useState<string>("");
  const [otpError, setOtpError] = useState<string | null>(null);

  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { loginWithOtp, verifyOtp, isAuthenticated, isLoading, isLoggingIn } = useAuth();

  // Form setup
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || "/";
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  // Handle form submission (Step 1)
  const onSubmit = async (data: SignInFormData) => {
    try {
      const res = await loginWithOtp({
        email: data.email.toLocaleLowerCase(),
        password: data.password,
      });
      if (res.success && res.message.includes("OTP")) {
        setLoginEmail(data.email.toLocaleLowerCase());
        setStep("otp");
      } else {
        setError("root", { message: res.message || "Login failed" });
      }
    } catch (error: any) {
      setError("root", {
        message: error?.message || "Login failed",
      });
    }
  };

  // Handle OTP submission (Step 2)
  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError(null);
    try {
      const res = await verifyOtp(loginEmail, otp);
      if (res.success && res.data?.token) {
        // tokenManager.saveTokens(
        //   res.data.token,
        //   "", // If you have a refresh token, pass it here
        //   res.data.user,
        //   res.data.expires_at
        // );
        navigate("/", { replace: true });
      } else {
        setOtpError(res.message || "OTP verification failed");
      }
    } catch (error: any) {
      setOtpError(error?.message || "OTP verification failed");
    }
  };


  // Show loading if auth is being checked
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Checking authentication...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Welcome back</CardTitle>
          <CardDescription className="text-center">
            Sign in to your SneakerAsk account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === "login" ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

              {/* Error Alert */}
              {errors.root && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errors.root.message}</AlertDescription>
                </Alert>
              )}

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  {...register("email")}
                  className={errors.email ? "border-destructive" : ""}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    {...register("password")}
                    className={errors.password ? "border-destructive" : ""}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password.message}</p>
                )}
              </div>

              {/* Forgot Password */}
              <div className="flex items-center justify-between">
                <Button
                  type="button"
                  variant="link"
                  className="px-0"
                  onClick={() => navigate("/forgot-password")}
                >
                  Forgot password?
                </Button>
              </div>

              {/* Submit Button */}
              <Button type="submit" className="w-full" disabled={isSubmitting || isLoggingIn}>
                {isSubmitting || isLoggingIn ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleOtpSubmit} className="space-y-4">
              <Alert>
                <AlertDescription>
                  OTP sent to <span className="font-medium">{loginEmail}</span>. Please check your email.
                </AlertDescription>
              </Alert>
              <div className="space-y-2">
                <Label htmlFor="otp">Enter OTP</Label>
                <Input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={e => setOtp(e.target.value)}
                  placeholder="Enter the OTP"
                  maxLength={6}
                  autoFocus
                />
                {otpError && (
                  <p className="text-sm text-destructive">{otpError}</p>
                )}
              </div>
              <Button type="submit" className="w-full">
                Verify OTP
              </Button>
              <Button
                type="button"
                variant="link"
                className="w-full"
                onClick={() => setStep("login")}
              >
                Back to Login
              </Button>
            </form>
          )}

        </CardContent>
      </Card>
    </div>
  );
};

export default SignIn;