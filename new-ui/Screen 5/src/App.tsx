import { useEffect } from "react";
import { Sparkles, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function App() {
  return (
    <div>
      <div className="bg-white text-neutral-950 w-full h-fit h-fit min-h-screen w-screen min-w-screen max-w-screen overflow-visible">
        <div className="min-h-[956px] transition-colors bg-white text-neutral-950 flex px-8 py-12 flex-col justify-center items-center gap-6 w-full">
          <div className="flex items-center gap-3">
            <button className="transition-colors font-medium rounded-full text-sm leading-5 border-black/1 border-1 border-solid flex px-4 items-center gap-2 h-10">
              <Sun className="size-4" />
              <span />
            </button>
          </div>
          <div className="max-w-[420px] shadow-sm transition-colors rounded-3xl border-black/1 border-1 border-solid p-8 w-full">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center gap-3">
                <div className="rounded-2xl flex justify-center items-center w-11 h-11">
                  <Sparkles className="size-5" />
                </div>
                <div className="font-semibold text-xl leading-7 tracking-tight">
                  VoiceBox
                </div>
              </div>
              <div className="grid grid-cols-2 transition-colors rounded-xl p-1">
                <button className="transition-colors font-medium rounded-lg text-sm leading-5 h-10">
                  Sign In
                </button>
                <button className="transition-colors font-medium rounded-lg text-sm leading-5 h-10">
                  Sign Up
                </button>
              </div>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label className="font-medium text-sm leading-5">Email</label>
                  <Input
                    value="you@example.com"
                    className="transition-colors rounded-xl h-11"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-medium text-sm leading-5">
                    Password
                  </label>
                  <Input
                    value="••••••••"
                    className="transition-colors rounded-xl h-11"
                  />
                </div>
                <div className="hidden flex-col gap-2">
                  <label className="font-medium text-sm leading-5">Name</label>
                  <Input
                    value="Jane Doe"
                    className="transition-colors rounded-xl h-11"
                  />
                </div>
                <Button className="transition-colors font-medium rounded-xl w-full h-11" />
              </div>
              <p className="text-center text-xs leading-4">
                By continuing you agree to VoiceBox's Terms and Privacy Policy.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
