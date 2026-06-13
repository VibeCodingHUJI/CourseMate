import React from "react";
import { Zap, ShieldCheck } from "lucide-react";
import { supabase } from "../supabaseClient";

const AuthPage = ({ onLogin }) => {
  const handleGoogleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    if (error) alert("שגיאה בכניסה עם Google: " + error.message);
  };

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

          <p className="text-xs text-slate-400 leading-relaxed mt-6">
            הפרויקט נבנה ע"י סטודנטיות במסגרת קורס באוניברסיטה העברית ומטרתו לייצר מענה משלים לצרכים של הסטודנטים בעת הרישום לקורסים ובניית המערכת.
            <br />
            ליצירת קשר:{" "}
            <a href="mailto:coursmatehuji@gmail.com" className="text-indigo-400 hover:underline">coursmatehuji@gmail.com</a>
          </p>
        </div>

        {/* Left side — card */}
        <div className="w-full lg:w-auto lg:min-w-[420px] lg:max-w-[460px]">
          <div className="bg-white rounded-[32px] shadow-2xl shadow-indigo-500/10 border border-slate-100 animate-in fade-in zoom-in-95 duration-500">
            <div className="p-8 sm:p-10">
              {/* Logo + title */}
              <div className="flex flex-col items-center mb-8">
                <img src="/logo.png" alt="CourseMate Logo" className="h-16 w-16 object-contain mb-3" />
                <h2 className="text-2xl font-black text-indigo-600 tracking-tight">ברוכים הבאים ל-CourseMate</h2>
                <p className="text-sm text-slate-500 font-medium mt-1 text-center">כניסה עם חשבון Google של האוניברסיטה העברית</p>
              </div>

              {/* Google button */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full bg-white border-2 border-slate-200 text-slate-800 py-4 rounded-2xl font-black text-base hover:bg-slate-50 hover:border-indigo-300 active:scale-95 transition-all flex items-center justify-center gap-3 shadow-sm"
              >
                <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                כניסה עם Google
              </button>

              {/* Domain notice */}
              <div className="mt-4 flex items-start gap-2 bg-indigo-50 border border-indigo-100 rounded-2xl px-4 py-3">
                <ShieldCheck className="h-4 w-4 text-indigo-500 shrink-0 mt-0.5" />
                <p className="text-xs text-indigo-700 font-bold leading-relaxed">
                  גישה למשתמשים עם כתובת <span className="font-black">@mail.huji.ac.il</span> בלבד
                </p>
              </div>

              {/* Guest */}
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => onLogin({
                    id: `guest-${Math.random().toString(36).substr(2, 9)}`,
                    name: "אורח/ת",
                    track: "General",
                    isGuest: true,
                  })}
                  className="w-full bg-slate-100 text-slate-500 py-3.5 rounded-2xl font-black text-sm hover:bg-slate-200 active:scale-95 transition-all"
                >
                  כניסה כאורח/ת
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default AuthPage;
