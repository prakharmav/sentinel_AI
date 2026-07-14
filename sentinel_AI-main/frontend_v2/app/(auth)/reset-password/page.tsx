"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { resetPasswordSchema, type ResetPasswordFormData } from "@/lib/validations/auth"
import { motion, AnimatePresence } from "framer-motion"
import { Eye, EyeOff, Loader2, ArrowLeft, CheckCircle, Lock, Check, X } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

const requirements = [
  { label: "At least 8 characters", test: (v: string) => v.length >= 8 },
  { label: "One uppercase letter", test: (v: string) => /[A-Z]/.test(v) },
  { label: "One number", test: (v: string) => /[0-9]/.test(v) },
  { label: "One special character", test: (v: string) => /[^A-Za-z0-9]/.test(v) },
]

export default function ResetPasswordPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = React.useState(false)
  const [showPassword, setShowPassword] = React.useState(false)
  const [showConfirm, setShowConfirm] = React.useState(false)
  const [success, setSuccess] = React.useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onChange",
  })

  const passwordValue = watch("password", "")

  const onSubmit = async () => {
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsLoading(false)
    setSuccess(true)
  }

  return (
    <div className="space-y-8">
      <Link
        href="/verify-otp"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors focus-ring rounded"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </Link>

      <AnimatePresence mode="wait">
        {!success ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground">Create new password</h2>
              <p className="text-sm text-muted-foreground mt-1.5">
                Your new password must meet the security requirements below.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
              {/* New Password */}
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-foreground">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className={cn(
                      "flex h-10 w-full rounded-lg border bg-transparent pl-10 pr-10 py-2 text-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      errors.password ? "border-destructive" : "border-input"
                    )}
                    {...register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    tabIndex={-1}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Requirements checklist */}
              <div className="space-y-1.5">
                {requirements.map((req) => {
                  const met = req.test(passwordValue)
                  return (
                    <div key={req.label} className="flex items-center gap-2 text-xs">
                      {met ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <X className="w-3.5 h-3.5 text-muted-foreground/40" />
                      )}
                      <span className={cn(met ? "text-emerald-500" : "text-muted-foreground")}>{req.label}</span>
                    </div>
                  )
                })}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    id="confirmPassword"
                    type={showConfirm ? "text" : "password"}
                    placeholder="••••••••"
                    className={cn(
                      "flex h-10 w-full rounded-lg border bg-transparent pl-10 pr-10 py-2 text-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      errors.confirmPassword ? "border-destructive" : "border-input"
                    )}
                    {...register("confirmPassword")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    tabIndex={-1}
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-destructive" role="alert">
                    {errors.confirmPassword.message}
                  </motion.p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center justify-center gap-2 w-full h-10 rounded-lg bg-primary text-primary-foreground text-sm font-medium transition-all hover:bg-primary/90 active:scale-[0.98] disabled:opacity-50 focus-ring"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Reset Password"
                )}
              </button>
            </form>
          </motion.div>
        ) : (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-4 py-8"
          >
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto">
              <CheckCircle className="w-7 h-7 text-emerald-500" />
            </div>
            <h3 className="text-xl font-bold text-foreground">Password Updated</h3>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
              Your password has been successfully reset. You can now sign in with your new credentials.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 h-10 px-6 rounded-lg bg-primary text-primary-foreground text-sm font-medium transition-all hover:bg-primary/90 focus-ring"
            >
              Sign In
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
