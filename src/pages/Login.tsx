import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from 'firebase/auth';
import { auth } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { LogIn, Lock, ArrowRight, Chrome, Phone, ShieldQuestion, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import { Logo } from '../components/Logo';

export const Login: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [isProcessing, setIsProcessing] = useState(false);

  // Form State
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Captcha State
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [captchaAnswer, setCaptchaAnswer] = useState('');

  const from = (location.state as any)?.from?.pathname || '/';

  useEffect(() => {
    if (user && !loading) {
      navigate(from, { replace: true });
    }
  }, [user, loading, navigate, from]);

  // Generate Math Captcha
  const generateCaptcha = () => {
    setNum1(Math.floor(Math.random() * 10) + 1);
    setNum2(Math.floor(Math.random() * 10) + 1);
    setCaptchaAnswer('');
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  const handleGoogleLogin = async () => {
    setIsProcessing(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      toast.success('Successfully logged in!');
    } catch (error: any) {
      console.error('Login error:', error);
      handleAuthError(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const validateCommon = () => {
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      toast.error('Please enter a valid phone number (at least 10 digits).');
      return null;
    }

    if (parseInt(captchaAnswer) !== num1 + num2) {
      toast.error('Incorrect math captcha answer. Please try again.');
      generateCaptcha();
      return null;
    }
    
    return `${cleanPhone}@smartbasket.app`;
  };

  const handleSignIn = async (e: React.MouseEvent) => {
    e.preventDefault();
    const dummyEmail = validateCommon();
    if (!dummyEmail) return;

    if (!password) {
      toast.error('Please enter your password.');
      return;
    }

    setIsProcessing(true);
    try {
      await signInWithEmailAndPassword(auth, dummyEmail, password);
      toast.success('Successfully logged in!');
    } catch (error: any) {
      console.error('Auth error:', error);
      handleAuthError(error);
      generateCaptcha();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSignUp = async (e: React.MouseEvent) => {
    e.preventDefault();
    const dummyEmail = validateCommon();
    if (!dummyEmail) return;

    if (!password) {
      toast.error('Please enter a password.');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    setIsProcessing(true);
    try {
      await createUserWithEmailAndPassword(auth, dummyEmail, password);
      toast.success('Account created successfully!');
    } catch (error: any) {
      console.error('Auth error:', error);
      handleAuthError(error);
      generateCaptcha();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAuthError = (error: any) => {
    let errorMessage = 'Authentication failed. Please try again.';
    if (error.code === 'auth/popup-blocked') {
      errorMessage = 'Popup blocked by browser. Please allow popups for this site.';
    } else if (error.code === 'auth/cancelled-popup-request') {
      errorMessage = 'Login cancelled.';
    } else if (error.code === 'auth/unauthorized-domain') {
      errorMessage = 'This domain is not authorized for login. Please check Firebase console.';
    } else if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
      errorMessage = 'Invalid phone number or password.';
    } else if (error.code === 'auth/email-already-in-use') {
      errorMessage = 'An account with this phone number already exists. Please sign in.';
    } else if (error.code === 'auth/weak-password') {
      errorMessage = 'Password should be at least 6 characters.';
    } else if (error.message) {
      errorMessage = error.message;
    }
    toast.error(errorMessage);
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center p-6 bg-gray-50/50 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-brand-100 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl opacity-30" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-brand-200 rounded-full translate-x-1/2 translate-y-1/2 blur-3xl opacity-30" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-xl bg-white rounded-3xl lg:rounded-[4rem] shadow-2xl shadow-brand-900/5 overflow-hidden border border-gray-100 relative z-10 my-8"
      >
        <div className="p-8 lg:p-12 md:p-16">
          <div className="flex flex-col items-center text-center mb-8">
            <Logo size="lg" className="mb-6 group-hover:scale-105 transition-transform duration-500" />
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-[2px] bg-brand-600" />
              <span className="text-[10px] font-black text-brand-600 uppercase tracking-[0.3em]">
                Secure Access
              </span>
            </div>
            <h1 className="font-display text-3xl lg:text-4xl font-black text-gray-900 mb-3 tracking-tight leading-none">
              Welcome to <span className="text-brand-600 italic">SmartBasket</span>
            </h1>
            <p className="text-sm text-gray-500 max-w-xs leading-relaxed font-medium">
              Sign in or create an account to access your orders, cart, and personalized grocery experience.
            </p>
          </div>

          <div className="space-y-6">
            {/* Google Login Button */}
            <button
              onClick={handleGoogleLogin}
              disabled={isProcessing}
              type="button"
              className="w-full flex items-center justify-between bg-white border-2 border-gray-100 p-4 lg:p-6 rounded-2xl lg:rounded-[2rem] font-black uppercase tracking-[0.15em] text-[10px] lg:text-xs hover:bg-gray-50 hover:border-brand-600 hover:shadow-xl hover:shadow-brand-900/5 transition-all group disabled:opacity-50 active:scale-95"
            >
              <div className="flex items-center gap-3 lg:gap-5">
                <div className="w-8 h-8 lg:w-10 lg:h-10 bg-white rounded-lg lg:rounded-xl flex items-center justify-center shadow-sm border border-gray-100 group-hover:scale-110 transition-transform">
                  <Chrome className="w-5 h-5 lg:w-6 lg:h-6 text-gray-700" />
                </div>
                <span className="text-gray-900">Continue with Google</span>
              </div>
              <ArrowRight className="w-4 h-4 lg:w-5 lg:h-5 text-brand-600 group-hover:translate-x-2 transition-transform" />
            </button>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-100"></div>
              </div>
              <div className="relative flex justify-center text-[9px] font-black uppercase tracking-[0.4em]">
                <span className="bg-white px-4 text-gray-400">OR</span>
              </div>
            </div>

            {/* Unified Form */}
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block px-1 mb-2">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter your phone number"
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all font-medium text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block px-1 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all font-medium text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block px-1 mb-2">Re-enter Password (For New Accounts)</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all font-medium text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block px-1 mb-2">Security Check: {num1} + {num2} = ?</label>
                <div className="relative">
                  <ShieldQuestion className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    value={captchaAnswer}
                    onChange={(e) => setCaptchaAnswer(e.target.value)}
                    placeholder="Enter the sum"
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all font-medium text-sm"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6">
                <button
                  onClick={handleSignIn}
                  disabled={isProcessing || !phone || !password || !captchaAnswer}
                  className="w-full bg-white text-brand-600 border-2 border-brand-600 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-brand-50 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  Sign In
                </button>
                <button
                  onClick={handleSignUp}
                  disabled={isProcessing || !phone || !password || !confirmPassword || !captchaAnswer}
                  className="w-full bg-brand-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-brand-700 transition-all disabled:opacity-50 shadow-lg shadow-brand-200 flex items-center justify-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  Create Account
                </button>
              </div>
            </div>

            <div className="text-center space-y-4 pt-4">
              <p className="text-[10px] text-gray-400 font-bold leading-relaxed max-w-xs mx-auto">
                By continuing, you agree to our <span className="text-brand-600 hover:underline cursor-pointer">Terms of Service</span> and <span className="text-brand-600 hover:underline cursor-pointer">Privacy Policy</span>.
              </p>
              
              <div className="flex items-center justify-center gap-1.5 text-[9px] font-black text-brand-600 uppercase tracking-widest opacity-50">
                <Lock className="w-3 h-3" />
                End-to-End Encrypted
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
