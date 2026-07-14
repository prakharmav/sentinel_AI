"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Page() {
  const router = useRouter();
  
  // Form state
  const [role, setRole] = useState<'police' | 'citizen' | 'gov'>('police');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // MFA flow state
  const [mfaChallenge, setMfaChallenge] = useState(false);
  const [exchangeToken, setExchangeToken] = useState('');
  const [mfaCode, setMfaCode] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      if (!mfaChallenge) {
        // Step 1: Login request using standard URL encoded Form data
        const formData = new URLSearchParams();
        formData.append('username', identifier);
        formData.append('password', password);
        formData.append('scope', role);

        const response = await fetch('http://localhost:8000/api/v1/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: formData.toString(),
        });

        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.detail || 'Login failed');
        }

        // Challenge issued, show MFA input
        setExchangeToken(data.exchange_token);
        setMfaChallenge(true);
      } else {
        // Step 2: MFA verification
        const response = await fetch('http://localhost:8000/api/v1/auth/mfa/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            exchange_token: exchangeToken,
            mfa_code: mfaCode
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.detail || 'MFA verification failed');
        }

        // Store tokens securely in localStorage
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('user_role', role);

        // Redirect to dashboard
        router.push('/dashboard');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background relative px-md overflow-hidden">
      {/* Background Texture/Gradient for depth */}
      <div className="absolute inset-0 z-0 pointer-events-none" style={{background: "radial-gradient(circle at 50% 0%, rgba(62, 144, 255, 0.05) 0%, transparent 70%)"}}></div>
      
      {/* Login Container */}
      <main className="w-full max-w-md glass-panel-level2 rounded-xl p-lg md:p-xl z-10 shadow-[0_20px_40px_rgba(0,0,0,0.4)] relative">
        {/* Header */}
        <div className="flex flex-col items-center mb-xl">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-sm border border-primary/20">
            <span className="material-symbols-outlined text-primary text-[28px]" style={{fontVariationSettings: "'FILL' 1"}}>security</span>
          </div>
          <h1 className="font-display-lg text-headline-lg-mobile md:text-headline-lg text-on-surface tracking-tight">SentinelAI</h1>
          <p className="font-body-sm text-on-surface-variant mt-xs">Secure Command Access</p>
        </div>

        {/* Role Selection */}
        <div aria-label="Role Selection" className="flex bg-surface-container-low rounded-lg p-xs mb-lg border border-white/5" role="tablist">
          <button 
            type="button"
            aria-selected={role === 'police'} 
            onClick={() => setRole('police')}
            className={`flex-1 py-sm rounded-md font-label-md text-label-md transition-all text-center border ${role === 'police' ? 'bg-surface-variant text-on-surface border-white/5 shadow-sm' : 'text-on-surface-variant hover:text-on-surface border-transparent hover:bg-white/5'}`} 
            id="tab-police" 
            role="tab"
          >
            Police
          </button>
          <button 
            type="button"
            aria-selected={role === 'citizen'} 
            onClick={() => setRole('citizen')}
            className={`flex-1 py-sm rounded-md font-label-md text-label-md transition-all text-center border ${role === 'citizen' ? 'bg-surface-variant text-on-surface border-white/5 shadow-sm' : 'text-on-surface-variant hover:text-on-surface border-transparent hover:bg-white/5'}`} 
            id="tab-citizen" 
            role="tab"
          >
            Citizen
          </button>
          <button 
            type="button"
            aria-selected={role === 'gov'} 
            onClick={() => setRole('gov')}
            className={`flex-1 py-sm rounded-md font-label-md text-label-md transition-all text-center border ${role === 'gov' ? 'bg-surface-variant text-on-surface border-white/5 shadow-sm' : 'text-on-surface-variant hover:text-on-surface border-transparent hover:bg-white/5'}`} 
            id="tab-gov" 
            role="tab"
          >
            Government
          </button>
        </div>

        {/* Login Form */}
        <form className="flex flex-col gap-md" id="loginForm" onSubmit={handleSubmit}>
          {errorMsg && (
            <div className="p-sm bg-error/10 border border-error/20 text-error rounded-lg text-label-md text-center">
              {errorMsg}
            </div>
          )}

          {!mfaChallenge ? (
            <>
              {/* Username / Badge ID */}
              <div className="flex flex-col gap-xs">
                <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="identifier">
                  {role === 'police' ? 'Badge ID' : role === 'citizen' ? 'Mobile Number' : 'Email Address'}
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">
                    {role === 'police' ? 'badge' : role === 'citizen' ? 'phone' : 'mail'}
                  </span>
                  <input 
                    aria-required="true" 
                    className="input-field w-full h-10 rounded-lg pl-xl pr-sm text-on-surface font-body-md transition-colors bg-surface-container-lowest/50 border border-white/10 focus:border-primary focus:outline-none" 
                    id="identifier" 
                    placeholder={role === 'police' ? 'Enter Badge ID' : role === 'citizen' ? 'Enter Phone Number' : 'Enter Email'} 
                    required 
                    type={role === 'citizen' ? 'tel' : 'text'}
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="flex flex-col gap-xs">
                <div className="flex justify-between items-center">
                  <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="password">Password</label>
                  <a className="font-label-sm text-label-sm text-primary hover:text-primary-container transition-colors focus:outline-none focus:ring-1 focus:ring-primary rounded" href="#">Forgot Password?</a>
                </div>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">lock</span>
                  <input 
                    aria-required="true" 
                    className="input-field w-full h-10 rounded-lg pl-xl pr-xl text-on-surface font-body-md transition-colors bg-surface-container-lowest/50 border border-white/10 focus:border-primary focus:outline-none" 
                    id="password" 
                    placeholder="••••••••" 
                    required 
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button 
                    aria-label="Toggle password visibility" 
                    className="absolute right-sm top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface focus:outline-none" 
                    id="togglePassword" 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <span className="material-symbols-outlined text-[18px]" id="visibilityIcon">
                      {showPassword ? 'visibility' : 'visibility_off'}
                    </span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* MFA Verification Challenge Input */
            <div className="flex flex-col gap-xs">
              <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="mfa_code">Enter Authenticator MFA Code</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">security</span>
                <input 
                  aria-required="true" 
                  className="input-field w-full h-10 rounded-lg pl-xl pr-sm text-on-surface font-body-md transition-colors bg-surface-container-lowest/50 border border-white/10 focus:border-primary focus:outline-none tracking-widest text-center" 
                  id="mfa_code" 
                  placeholder="123456" 
                  required 
                  maxLength={6}
                  type="text"
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value)}
                />
              </div>
              <p className="text-xs text-on-surface-variant/70 mt-1 text-center">For testing purposes, enter <strong>123456</strong>.</p>
            </div>
          )}

          {/* Primary Action */}
          <button 
            className="btn-primary w-full h-10 rounded-lg font-label-md text-label-md flex items-center justify-center gap-sm mt-sm transition-all bg-primary text-on-primary hover:bg-primary-container disabled:opacity-50" 
            id="loginBtn" 
            type="submit"
            disabled={loading}
          >
            <span className="material-symbols-outlined text-[18px]" style={{fontVariationSettings: "'FILL' 1"}}>
              {mfaChallenge ? 'verified_user' : 'login'}
            </span>
            <span className="btn-text">{loading ? 'Processing...' : mfaChallenge ? 'Verify MFA Code' : 'Secure Login'}</span>
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-sm my-lg">
          <div className="h-px bg-white/10 flex-1"></div>
          <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Or access with</span>
          <div className="h-px bg-white/10 flex-1"></div>
        </div>

        {/* Secondary Actions */}
        <div className="flex flex-col gap-sm">
          <button className="btn-ghost w-full h-10 rounded-lg font-label-md text-label-md flex items-center justify-center gap-sm transition-all border border-white/10 text-on-surface hover:bg-white/5 focus:outline-none" type="button">
            <span className="material-symbols-outlined text-[18px]">fingerprint</span>
            Biometric Login
          </button>
          <button className="btn-ghost w-full h-10 rounded-lg font-label-md text-label-md flex items-center justify-center gap-sm transition-all border border-white/10 text-on-surface hover:bg-white/5 focus:outline-none" type="button">
            <span className="material-symbols-outlined text-[18px]">account_balance</span>
            Sign in with Government SSO
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-xl text-center z-10">
        <div className="flex items-center justify-center gap-md font-label-sm text-label-sm text-on-surface-variant">
          <a className="hover:text-on-surface transition-colors focus:outline-none focus:underline" href="#">Privacy Policy</a>
          <span className="w-1 h-1 rounded-full bg-on-surface-variant/50"></span>
          <a className="hover:text-on-surface transition-colors focus:outline-none focus:underline" href="#">Terms of Service</a>
        </div>
        <p className="font-label-sm text-label-sm text-on-surface-variant/50 mt-sm">© 2024 SentinelAI Public Safety Systems</p>
      </footer>
    </div>
  );
}
