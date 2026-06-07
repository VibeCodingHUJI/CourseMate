import React, { useState, useEffect, useRef } from "react";
import { ChevronDown, Check, Eye, EyeOff, Zap } from "lucide-react";
import { supabase } from "../supabaseClient";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const AuthPage = ({ onLogin }) => {
  const [authMode, setAuthMode] = useState("signup");
  const [authForm, setAuthForm] = useState({
    name: "",
    email: "",
    password: "",
    track: "",
  });

  const [studyTracks, setStudyTracks] = useState([]);
  const [trackSearch, setTrackSearch] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetch(`${API}/api/combinations`)
      .then((res) => res.json())
      .then((data) => {
        const tracks = Array.isArray(data) ? data : data.value || [];
        setStudyTracks(Array.isArray(tracks) ? tracks : []);
      })
      .catch(() => setStudyTracks([]));
  }, []);

  const filteredTracks = (Array.isArray(studyTracks) ? studyTracks : []).filter((t) =>
    t?.label?.toLowerCase().includes(trackSearch.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleGoogleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) alert("שגיאה בכניסה עם Google: " + error.message);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (authMode === "signup" && (!authForm.name || !authForm.email || !authForm.password || !authForm.track)) {
      return alert("נא למלא את כל השדות");
    }
    if (!authForm.email.endsWith("@mail.huji.ac.il")) {
      return alert("נא להשתמש בכתובת אימייל של האוניברסיטה העברית (@mail.huji.ac.il)");
    }

    try {
      const url = authMode === "signup" ? `${API}/api/auth/signup` : `${API}/api/auth/login`;
      const body =
        authMode === "signup"
          ? { name: authForm.name, email: authForm.email, password: authForm.password, track: authForm.track }
          : { email: authForm.email, password: authForm.password };

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        throw new Error(`שגיאת שרת (${response.status}) — ודאו שהשרת פועל`);
      }

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      onLogin(data);
    } catch (err) {
      alert(err.message || "שגיאה בהתחברות לשרת");
    }
  };

  const selectedTrackLabel = studyTracks.find((t) => t.value === authForm.track)?.label || "";

  const inputBase =
    "w-full bg-slate-50 border-2 border-transparent focus:border-indigo-300 focus:bg-white rounded-2xl px-5 py-3 outline-none transition-all font-medium text-right";

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6 lg:px-16 py-8" dir="rtl">
      <div className="w-full max-w-7xl flex flex-row gap-8 lg:gap-16 items-center">

        {/* Right side — hero copy */}
        <div className="flex-1 text-right hidden lg:flex flex-col justify-center -mt-10">
          <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-600 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-6">
            <Zap className="h-3.5 w-3.5" />
            <span>הפלטפורמה הטובה ביותר לבחירת קורסים</span>
          </div>

          <h1 className="text-5xl xl:text-6xl font-black text-slate-900 leading-tight mb-5">
            בחרו את הקורסים
            <br />
            שלכם בצורה <span className="text-indigo-600">חכמה.</span>
          </h1>

          <p className="text-lg text-slate-500 font-medium leading-relaxed">
            מערכת ביקורות הקורסים והמרצים העדכנית ביותר באוניברסיטה העברית.
            <br />
            קוראים דעות אמיתיות, שואלים שאלות, עוזרים לאחרים, ומפיקים את המקסימום
            <br />
            מהתואר שלכם — הכל במקום אחד.
          </p>
        </div>

        {/* Left side — form card */}
        <div className="w-full lg:w-auto lg:min-w-[480px] lg:max-w-[520px]">
          <div className="bg-white rounded-[32px] shadow-2xl shadow-indigo-500/10 border border-slate-100 overflow-visible animate-in fade-in zoom-in-95 duration-500">
            <div className="p-6 sm:p-8">
              <div className="flex flex-col items-center mb-4">
                <img src="/logo.png" alt="CourseMate Logo" className="h-14 w-14 object-contain mb-2" />
                <h2 className="text-xl font-black text-slate-900 tracking-tight">
                  {authMode === "signup" ? "הרשמה ל-CourseMate" : "ברוכים השבים"}
                </h2>
              </div>

              <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-4">
                <button
                  onClick={() => setAuthMode("signup")}
                  className={`flex-1 py-2.5 rounded-xl font-black transition-all ${authMode === "signup" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
                >
                  הרשמה
                </button>
                <button
                  onClick={() => setAuthMode("login")}
                  className={`flex-1 py-2.5 rounded-xl font-black transition-all ${authMode === "login" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
                >
                  התחברות
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                {authMode === "signup" && (
                  <input
                    type="text"
                    required
                    value={authForm.name}
                    onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                    className={inputBase}
                    placeholder="שם מלא"
                  />
                )}

                <input
                  type="email"
                  required
                  value={authForm.email}
                  onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                  className={inputBase}
                  placeholder="כתובת אימייל (חובה mail.huji.ac.il@)"
                />

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={authForm.password}
                    onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                    className={`${inputBase} pl-14`}
                    placeholder="סיסמה"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>

                {authMode === "signup" && (
                  <div className="relative" ref={dropdownRef}>
                    <div
                      className="w-full bg-slate-50 border-2 border-transparent focus-within:border-indigo-300 rounded-2xl px-5 py-3 transition-all cursor-pointer flex items-center justify-between gap-2"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    >
                      <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
                      <div className="flex-1 text-right overflow-hidden">
                        {isDropdownOpen ? (
                          <input
                            autoFocus
                            type="text"
                            placeholder="חפש מסלול..."
                            value={trackSearch}
                            onChange={(e) => setTrackSearch(e.target.value)}
                            className="bg-transparent outline-none w-full text-right font-medium"
                          />
                        ) : (
                          <span className={`font-medium truncate block ${selectedTrackLabel ? "text-slate-900" : "text-slate-400"}`}>
                            {selectedTrackLabel || "בחירת מסלול לימוד"}
                          </span>
                        )}
                      </div>
                    </div>

                    {isDropdownOpen && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="max-h-52 overflow-y-auto">
                          {filteredTracks.length > 0 ? (
                            filteredTracks.map((t) => (
                              <div
                                key={t.value}
                                onClick={() => {
                                  setAuthForm({ ...authForm, track: t.value });
                                  setTrackSearch("");
                                  setIsDropdownOpen(false);
                                }}
                                className="px-6 py-3 hover:bg-slate-50 flex items-center justify-between cursor-pointer transition-colors group"
                              >
                                {authForm.track === t.value && <Check className="h-4 w-4 text-indigo-600 shrink-0" />}
                                <span
                                  className={`font-bold text-right flex-1 text-sm ${authForm.track === t.value ? "text-indigo-600" : "text-slate-700 group-hover:text-indigo-600"}`}
                                >
                                  {t.label}
                                </span>
                              </div>
                            ))
                          ) : (
                            <div className="px-6 py-4 text-slate-400 text-sm text-center font-bold">לא נמצאו מסלולים</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-indigo-600 text-white py-3.5 rounded-2xl font-black text-base hover:bg-indigo-700 shadow-xl shadow-indigo-600/20 active:scale-95 transition-all"
                >
                  {authMode === "login" ? "כניסה למערכת" : "הירשם עכשיו"}
                </button>
              </form>

              <div className="flex items-center gap-3 mt-3">
                <div className="flex-1 h-px bg-slate-200" />
                <span className="text-xs font-bold text-slate-400">או</span>
                <div className="flex-1 h-px bg-slate-200" />
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full bg-white border-2 border-slate-200 text-slate-700 py-3.5 rounded-2xl font-black text-base hover:bg-slate-50 hover:border-slate-300 active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                כניסה עם Google HUJI
              </button>

              <div className="mt-3">
                <button
                  type="button"
                  onClick={() => onLogin({
                    id: `guest-${Math.random().toString(36).substr(2, 9)}`,
                    name: "אורח/ת",
                    track: "General",
                    isGuest: true,
                  })}
                  className="w-full bg-slate-100 text-slate-600 py-3.5 rounded-2xl font-black text-base hover:bg-slate-200 active:scale-95 transition-all"
                >
                  כניסה כאורח/ת
                </button>
              </div>

              <div className="mt-3 text-center">
                <p className="text-sm text-slate-500 font-medium">
                  {authMode === "signup" ? "יש לך כבר חשבון?" : "אין לך חשבון?"}{" "}
                  <button
                    onClick={() => setAuthMode(authMode === "signup" ? "login" : "signup")}
                    className="text-indigo-600 font-black hover:underline"
                  >
                    {authMode === "signup" ? "התחבר" : "הירשם"}
                  </button>
                </p>
              </div>
            </div>

            <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 text-center rounded-b-[32px]">
              <p className="text-xs text-slate-400 font-medium">© CourseMate 2026</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AuthPage;
