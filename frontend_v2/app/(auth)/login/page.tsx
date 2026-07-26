"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { loginSchema, type LoginFormData } from "@/lib/validations/auth"
import { useAuthStore } from "@/store/auth-store"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Eye, EyeOff, Loader2, Shield, ArrowRight, AlertCircle, UserCircle } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { authApi, ApiError } from "@/lib/api-client"

const QUICK_ACCESS_ROLES = [
  { role: "Admin", email: "admin@sentinelai.io", color: "text-red-400" },
  { role: "Police", email: "police@sentinelai.io", color: "text-blue-400" },
  { role: "Investigator", email: "investigator@sentinelai.io", color: "text-yellow-400" },
  { role: "Citizen", email: "citizen@sentinelai.io", color: "text-green-400" },
]

export default function LoginPage() {
  const router = useRouter()
  const { login, setLoading, isLoading } = useAuthStore()
  const [showPassword, setShowPassword] = React.useState(false)
  const [serverError, setServerError] = React.useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isValid },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
  })

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true)
    setServerError(null)
    try {
      const response = await authApi.login(data.email, data.password)
      login(
        {
          id: response.user.id,
          name: response.user.name,
          email: response.user.email,
          role: response.user.role,
        },
        response.access_token
      )
      router.push("/dashboard")
    } catch (err) {
      if (err instanceof ApiError) {
        setServerError(err.message)
      } else {
        setServerError("Unable to reach the server. Please check your connection.")
      }
      setLoading(false)
    }
  }

  const fillQuickAccess = (email: string) => {
    setValue("email", email, { shouldValidate: true })
    setValue("password", "password", { shouldValidate: true })
  }

  return (
    <div className="space-y-6">
      {/* Mobile logo */}
      <div className="flex items-center gap-2 md:hidden mb-4">
        <div className="p-2 rounded-sm bg-primary/10 border border-primary/30">
          <Shield className="w-5 h-5 text-primary" />
        </div>
        <div>
          <span className="text-base font-bold tracking-tight text-foreground">
            Sentinel<span className="text-primary">AI</span>
          </span>
          <p className="text-[9px] uppercase tracking-[0.2em] text-primary/70">Cyber Command</p>
        </div>
      </div>

      {/* Header */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          Command Center Access
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          Authenticate to access the SentinelAI threat intelligence platform.
        </p>
      </div>

      {/* Quick Access Roles */}
      <div className="space-y-2">
        <p className="text-[10px] uppercase tracking-[0.2em] text-primary/70 font-medium">
          Quick Access — Demo Roles
        </p>
        <div className="grid grid-cols-2 gap-2">
          {QUICK_ACCESS_ROLES.map((r) => (
            <button
              key={r.role}
              type="button"
              onClick={() => fillQuickAccess(r.email)}
              className="flex items-center gap-2 p-2.5 rounded-sm border border-primary/20 bg-primary/5 hover:bg-primary/10 hover:border-primary/40 transition-all text-left group"
            >
              <UserCircle className={cn("w-4 h-4 shrink-0", r.color)} />
              <div>
                <p className="text-xs font-semibold text-foreground">{r.role}</p>
                <p className="text-[10px] text-muted-foreground truncate">{r.email}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-primary/20" />
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">or enter credentials</span>
        <div className="flex-1 h-px bg-primary/20" />
      </div>

      {/* Server Error Banner */}
      {serverError && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-3 p-3 rounded-sm bg-destructive/10 border border-destructive/30 text-xs text-destructive"
          role="alert"
        >
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{serverError}</span>
        </motion.div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {/* Email */}
        <div className="space-y-1.5">
          <label htmlFor="email" className="text-[11px] uppercase tracking-wider font-medium text-muted-foreground">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="admin@sentinelai.io"
            className={cn(
              "flex h-10 w-full rounded-sm border bg-background/50 px-3 py-2 text-sm font-mono transition-all placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50",
              errors.email ? "border-destructive focus-visible:ring-destructive" : "border-primary/30"
            )}
            {...register("email")}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "email-error" : undefined}
          />
          {errors.email && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              id="email-error"
              className="text-[11px] text-destructive"
              role="alert"
            >
              {errors.email.message}
            </motion.p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-[11px] uppercase tracking-wider font-medium text-muted-foreground">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-[11px] text-primary hover:text-primary/80 transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••"
              className={cn(
                "flex h-10 w-full rounded-sm border bg-background/50 px-3 py-2 pr-10 text-sm font-mono transition-all placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50",
                errors.password ? "border-destructive focus-visible:ring-destructive" : "border-primary/30"
              )}
              {...register("password")}
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? "password-error" : undefined}
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              id="password-error"
              className="text-[11px] text-destructive"
              role="alert"
            >
              {errors.password.message}
            </motion.p>
          )}
        </div>

        {/* Remember me */}
        <div className="flex items-center gap-2">
          <input
            id="remember"
            type="checkbox"
            className="h-3.5 w-3.5 rounded-sm border-primary/30 text-primary focus:ring-primary bg-background"
            {...register("remember")}
          />
          <label htmlFor="remember" className="text-xs text-muted-foreground">
            Remember this device
          </label>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="flex items-center justify-center gap-2 w-full h-10 rounded-sm bg-primary text-primary-foreground text-sm font-bold uppercase tracking-wider transition-all hover:shadow-[0_0_20px_rgba(0,255,255,0.4)] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Authenticating...
            </>
          ) : (
            <>
              Access Command Center
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Footer */}
      <div className="text-center space-y-1">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
          Authorized law enforcement personnel only
        </p>
        <p className="text-[10px] text-muted-foreground/60">
          All sessions are monitored, recorded & audited
        </p>
      </div>
    </div>
  )
}
