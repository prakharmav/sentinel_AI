"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Loader2, ArrowLeft, ShieldCheck } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

export default function VerifyOTPPage() {
  const router = useRouter()
  const [otp, setOtp] = React.useState<string[]>(Array(6).fill(""))
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState("")
  const [resendCooldown, setResendCooldown] = React.useState(30)
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([])

  // Cooldown timer
  React.useEffect(() => {
    if (resendCooldown <= 0) return
    const timer = setInterval(() => setResendCooldown((c) => c - 1), 1000)
    return () => clearInterval(timer)
  }, [resendCooldown])

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return
    setError("")
    const newOtp = [...otp]
    newOtp[index] = value.slice(-1)
    setOtp(newOtp)

    // Auto-advance
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
    if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6)
    if (pastedData.length === 0) return
    const newOtp = [...otp]
    for (let i = 0; i < pastedData.length; i++) {
      newOtp[i] = pastedData[i]
    }
    setOtp(newOtp)
    inputRefs.current[Math.min(pastedData.length, 5)]?.focus()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const code = otp.join("")
    if (code.length !== 6) {
      setError("Please enter the complete 6-digit code")
      return
    }
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setIsLoading(false)
    router.push("/reset-password")
  }

  const handleResend = () => {
    setResendCooldown(30)
    setOtp(Array(6).fill(""))
    inputRefs.current[0]?.focus()
  }

  return (
    <div className="space-y-8">
      <Link
        href="/forgot-password"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors focus-ring rounded"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </Link>

      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Verification Code</h2>
        <p className="text-sm text-muted-foreground mt-1.5">
          Enter the 6-digit code sent to your registered email address.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex justify-center gap-2.5" onPaste={handlePaste}>
          {otp.map((digit, i) => (
            <motion.input
              key={i}
              ref={(el) => { inputRefs.current[i] = el }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={cn(
                "w-12 h-14 text-center text-xl font-bold rounded-lg border bg-transparent transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                digit ? "border-primary text-foreground" : "border-input text-muted-foreground",
                error && "border-destructive focus-visible:ring-destructive"
              )}
              aria-label={`Digit ${i + 1}`}
            />
          ))}
        </div>

        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs text-destructive text-center"
            role="alert"
          >
            {error}
          </motion.p>
        )}

        <button
          type="submit"
          disabled={isLoading || otp.join("").length !== 6}
          className="flex items-center justify-center gap-2 w-full h-10 rounded-lg bg-primary text-primary-foreground text-sm font-medium transition-all hover:bg-primary/90 active:scale-[0.98] disabled:opacity-50 focus-ring"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Verifying...
            </>
          ) : (
            <>
              <ShieldCheck className="w-4 h-4" />
              Verify Code
            </>
          )}
        </button>

        <div className="text-center">
          {resendCooldown > 0 ? (
            <p className="text-xs text-muted-foreground">
              Resend code in <span className="font-medium text-foreground">{resendCooldown}s</span>
            </p>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              className="text-xs text-primary hover:text-primary/80 font-medium transition-colors focus-ring rounded"
            >
              Resend verification code
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
