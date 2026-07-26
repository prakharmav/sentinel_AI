"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { forgotPasswordSchema, type ForgotPasswordFormData } from "@/lib/validations/auth"
import { motion, AnimatePresence } from "framer-motion"
import { Loader2, ArrowLeft, Mail, CheckCircle } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = React.useState(false)
  const [submitted, setSubmitted] = React.useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onChange",
  })

  const onSubmit = async () => {
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsLoading(false)
    setSubmitted(true)
  }

  return (
    <div className="space-y-8">
      <Link
        href="/login"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors focus-ring rounded"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to sign in
      </Link>

      <AnimatePresence mode="wait">
        {!submitted ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground">Reset your password</h2>
              <p className="text-sm text-muted-foreground mt-1.5">
                Enter the email address associated with your account and we&apos;ll send a verification code.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-foreground">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="admin@sentinelai.gov.in"
                    className={cn(
                      "flex h-10 w-full rounded-lg border bg-transparent pl-10 pr-3 py-2 text-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      errors.email ? "border-destructive focus-visible:ring-destructive" : "border-input"
                    )}
                    {...register("email")}
                    aria-invalid={!!errors.email}
                  />
                </div>
                {errors.email && (
                  <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-destructive" role="alert">
                    {errors.email.message}
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
                    Sending...
                  </>
                ) : (
                  "Send Verification Code"
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
            <h3 className="text-xl font-bold text-foreground">Check your email</h3>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
              We&apos;ve sent a 6-digit verification code to{" "}
              <span className="font-medium text-foreground">{getValues("email")}</span>.
            </p>
            <Link
              href="/verify-otp"
              className="inline-flex items-center justify-center gap-2 h-10 px-6 rounded-lg bg-primary text-primary-foreground text-sm font-medium transition-all hover:bg-primary/90 focus-ring"
            >
              Enter Verification Code
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
