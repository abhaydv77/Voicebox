import { useEffect } from "react";
import { ArrowRight, Moon, Sparkles, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function App() {
  return (
    <div>
      <div className="bg-white text-neutral-950 w-full h-fit h-fit min-h-screen w-screen min-w-screen max-w-screen overflow-visible">
        <div className="min-h-[956px] transition-colors duration-300 bg-white text-neutral-950 flex px-8 py-12 justify-center items-start w-full">
          <div className="relative max-w-[720px] shadow-[0_1px_0_rgba(0,0,0,0.02),0_24px_80px_rgba(0,0,0,0.06)] rounded-3xl bg-white text-neutral-950 border-neutral-200 border-1 border-solid w-full overflow-hidden">
            <div className="absolute right-6 top-6">
              <button className="inline-flex transition-colors font-medium rounded-full text-sm leading-5 border-black/1 border-1 border-solid px-3 py-1.5 items-center gap-2">
                <Sun className="size-4" />
                <Moon className="size-4" />
                <span />
              </button>
            </div>
            <div className="text-center bg-white text-neutral-950 flex px-8 py-16 flex-col items-center gap-8">
              <div className="inline-flex shadow-sm rounded-full bg-white border-neutral-200 border-1 border-solid px-4 py-2 items-center gap-2">
                <div className="size-6 rounded-full bg-neutral-900 text-neutral-50 flex justify-center items-center">
                  <Sparkles className="size-3.5" />
                </div>
                <span className="font-medium text-neutral-950 text-sm leading-5">
                  VoiceBox
                </span>
              </div>
              <div className="max-w-[560px] flex flex-col gap-5">
                <h1 className="font-semibold text-neutral-950 text-5xl leading-[50px] tracking-tight">
                  Write like you, even with AI’s help
                </h1>
                <p className="text-neutral-500 text-lg leading-8">
                  VoiceBox learns your unique writing style to help you craft
                  authentic social posts that actually sound like you — not a
                  robot.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <a href="/voicebox">
                  <Button className="shadow-sm font-medium rounded-xl bg-neutral-900 text-neutral-50 text-base leading-6 p-6">
                    Get Started
                    <ArrowRight className="size-4" />
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
