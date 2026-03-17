"use client";

import { useLanguage } from "@/context/LanguageContext";
import { Globe } from "lucide-react";

export default function LanguageSelector() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="relative group flex items-center gap-1.5 bg-primary/5 hover:bg-primary/10 rounded-full px-3 py-1.5 transition-colors cursor-pointer border border-primary/10">
      <Globe className="w-4 h-4 text-primary/70" />
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value as any)}
        className="appearance-none bg-transparent text-xs font-bold text-primary focus:outline-none cursor-pointer uppercase pr-2"
        style={{ paddingRight: "12px", background: "transparent" }}
      >
        <option value="en">EN</option>
        <option value="hi">HI</option>
        <option value="ta">TA</option>
        <option value="bn">BN</option>
        <option value="mr">MR</option>
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center px-1 text-primary/50">
        <svg className="fill-current h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
        </svg>
      </div>
    </div>
  );
}
