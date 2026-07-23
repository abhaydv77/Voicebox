import { useEffect } from "react";
import {
  ArrowRight,
  BookOpen,
  LogOut,
  Moon,
  PenLine,
  Plus,
  Sparkles,
  Sun,
  TriangleAlert,
  User,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function App() {
  return (
    <div>
      <div className="min-h-screen bg-white text-neutral-950 w-full h-fit h-fit min-h-screen w-screen min-w-screen max-w-screen overflow-visible">
        <div className="relative min-h-screen w-full overflow-hidden">
          <div className="transition-opacity absolute inset-0">
            <div className="bg-zinc-950 absolute inset-0" />
            <div className="bg-white/8 absolute inset-0" />
          </div>
          <div className="relative min-h-screen flex flex-col">
            <header className="shrink-0 border-black/1 border-t-0 border-r-0 border-b-1 border-l-0 border-solid flex px-8 justify-between items-center h-16">
              <div className="flex items-center gap-2">
                <div className="size-8 shadow-sm rounded-lg bg-blue-600 text-white flex justify-center items-center">
                  <Sparkles className="size-4" />
                </div>
                <span className="font-semibold text-lg leading-7">
                  VoiceBox
                </span>
              </div>
              <div className="flex items-center gap-4">
                <button className="inline-flex transition rounded-full text-sm leading-5 border-black/1 border-1 border-solid px-3 py-1.5 items-center gap-2">
                  <Sun className="size-4" />
                  <Moon className="size-4" />
                  <span />
                </button>
                <div className="text-sm leading-5 flex items-center gap-2">
                  <User className="size-4" />
                  <span>alex@example.com</span>
                </div>
                <Button variant="outline" className="gap-2">
                  <LogOut className="size-4" />
                  Sign Out
                </Button>
              </div>
            </header>
            <div className="p-8 flex-1">
              <div className="flex mb-6 justify-between items-start gap-6">
                <div>
                  <h1 className="font-semibold text-2xl leading-8 mb-1">
                    Your Voices
                  </h1>
                  <p className="text-sm leading-5">
                    Manage and chat with your writing voice profiles
                  </p>
                </div>
                <div className="rounded-full text-sm leading-5 border-black/1 border-1 border-solid px-3 py-1">
                  VoicesEmpty
                </div>
              </div>
              <div className="rounded-xl border-black/1 border-1 border-solid hidden mb-6 px-4 py-3 justify-between items-center gap-4">
                <div className="flex items-center gap-3">
                  <TriangleAlert className="size-4 shrink-0" />
                  <div>
                    <div className="font-medium">Couldn't load your voices</div>
                    <div className="text-sm leading-5">
                      Failed to fetch GET /api/voicebox/voices. Please try
                      again.
                    </div>
                  </div>
                </div>
                <button className="font-medium">Retry</button>
              </div>
              <div className="grid grid-cols-4 gap-6">
                <Card className="shadow-sm p-6 gap-4">
                  <CardHeader className="p-0 gap-2">
                    <div className="size-12 font-semibold rounded-full bg-blue-100 text-blue-700 flex justify-center items-center">
                      L
                    </div>
                  </CardHeader>
                  <CardContent className="flex p-0 flex-col gap-2">
                    <span className="truncate font-medium">LinkedIn Voice</span>
                    <span className="inline-flex rounded-full text-xs leading-4 px-2 py-0.5 w-fit">
                      Own writing
                    </span>
                    <span className="text-xs leading-4">
                      Created Jan 12, 2025
                    </span>
                  </CardContent>
                </Card>
                <Card className="shadow-sm p-6 gap-4">
                  <CardHeader className="p-0 gap-2">
                    <div className="size-12 font-semibold rounded-full bg-green-100 text-green-700 flex justify-center items-center">
                      N
                    </div>
                  </CardHeader>
                  <CardContent className="flex p-0 flex-col gap-2">
                    <span className="truncate font-medium">
                      Naval Ravikant Style
                    </span>
                    <span className="inline-flex rounded-full text-xs leading-4 px-2 py-0.5 w-fit">
                      Writer style
                    </span>
                    <span className="text-xs leading-4">
                      Created Jan 9, 2025
                    </span>
                  </CardContent>
                </Card>
                <Card className="shadow-sm p-6 gap-4">
                  <CardHeader className="p-0 gap-2">
                    <div className="size-12 font-semibold rounded-full bg-purple-100 text-purple-700 flex justify-center items-center">
                      T
                    </div>
                  </CardHeader>
                  <CardContent className="flex p-0 flex-col gap-2">
                    <span className="truncate font-medium">
                      Twitter Threads And Hot...
                    </span>
                    <span className="inline-flex rounded-full text-xs leading-4 px-2 py-0.5 w-fit">
                      Own writing
                    </span>
                    <span className="text-xs leading-4">
                      Created Jan 5, 2025
                    </span>
                  </CardContent>
                </Card>
                <Card className="shadow-sm p-6 gap-4">
                  <CardHeader className="p-0 gap-2">
                    <div className="size-12 font-semibold rounded-full bg-orange-100 text-orange-700 flex justify-center items-center">
                      P
                    </div>
                  </CardHeader>
                  <CardContent className="flex p-0 flex-col gap-2">
                    <span className="truncate font-medium">
                      Paul Graham Style
                    </span>
                    <span className="inline-flex rounded-full text-xs leading-4 px-2 py-0.5 w-fit">
                      Writer style
                    </span>
                    <span className="text-xs leading-4">
                      Created Dec 28, 2024
                    </span>
                  </CardContent>
                </Card>
                <Card className="shadow-sm p-6 gap-4">
                  <CardHeader className="p-0 gap-2">
                    <div className="size-12 font-semibold rounded-full bg-blue-100 text-blue-700 flex justify-center items-center">
                      M
                    </div>
                  </CardHeader>
                  <CardContent className="flex p-0 flex-col gap-2">
                    <span className="truncate font-medium">
                      Marketing Newsletter
                    </span>
                    <span className="inline-flex rounded-full text-xs leading-4 px-2 py-0.5 w-fit">
                      Own writing
                    </span>
                    <span className="text-xs leading-4">
                      Created Dec 20, 2024
                    </span>
                  </CardContent>
                </Card>
                <Card className="shadow-sm p-6 gap-4">
                  <CardHeader className="p-0 gap-2">
                    <div className="size-12 font-semibold rounded-full bg-green-100 text-green-700 flex justify-center items-center">
                      C
                    </div>
                  </CardHeader>
                  <CardContent className="flex p-0 flex-col gap-2">
                    <span className="truncate font-medium">
                      Casual Blog Voice
                    </span>
                    <span className="inline-flex rounded-full text-xs leading-4 px-2 py-0.5 w-fit">
                      Own writing
                    </span>
                    <span className="text-xs leading-4">
                      Created Dec 14, 2024
                    </span>
                  </CardContent>
                </Card>
                <Card className="shadow-sm p-6 gap-4">
                  <CardHeader className="p-0 gap-2">
                    <div className="size-12 font-semibold rounded-full bg-purple-100 text-purple-700 flex justify-center items-center">
                      D
                    </div>
                  </CardHeader>
                  <CardContent className="flex p-0 flex-col gap-2">
                    <span className="truncate font-medium">
                      David Perell Style
                    </span>
                    <span className="inline-flex rounded-full text-xs leading-4 px-2 py-0.5 w-fit">
                      Writer style
                    </span>
                    <span className="text-xs leading-4">
                      Created Dec 2, 2024
                    </span>
                  </CardContent>
                </Card>
                <Card className="shadow-sm border-black/1 border-0 border-dashed p-6 justify-center items-center gap-4">
                  <Plus className="size-8" />
                  <span className="font-medium text-sm leading-5">
                    Add Voice
                  </span>
                </Card>
              </div>
            </div>
            <div className="bg-black/45 flex absolute inset-0 p-8 justify-center items-center">
              <div className="max-w-[520px] shadow-2xl rounded-2xl border-black/1 border-1 border-solid p-8 w-full">
                <div className="flex mb-6 justify-between items-start gap-4">
                  <div className="flex items-center gap-3">
                    <div className="font-medium text-sm leading-5 flex items-center gap-2">
                      <span className="size-6 rounded-full flex justify-center items-center">
                        1
                      </span>
                      <span>—</span>
                      <span className="size-6 rounded-full flex justify-center items-center">
                        2
                      </span>
                      <span>—</span>
                      <span className="size-6 rounded-full flex justify-center items-center">
                        3
                      </span>
                    </div>
                  </div>
                  <button>
                    <X className="size-4" />
                  </button>
                </div>
                <div className="flex mb-2 justify-between items-center">
                  <div>
                    <h2 className="font-semibold text-xl leading-7">{`Name & Source`}</h2>
                    <p className="text-sm leading-5 mt-1">
                      Give your voice a name and choose how to train it.
                    </p>
                  </div>
                  <button className="inline-flex transition rounded-full text-sm leading-5 border-black/1 border-1 border-solid px-3 py-1.5 items-center gap-2">
                    <Sun className="size-4" />
                    <Moon className="size-4" />
                    <span />
                  </button>
                </div>
                <div className="flex mt-6 flex-col gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="font-medium text-sm leading-5">
                      Voice Name
                    </label>
                    <Input placeholder="My LinkedIn Voice" defaultValue="" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <button className="transition text-left rounded-xl border-black/1 border-1 border-solid p-4">
                      <div className="flex mb-2 items-center gap-2">
                        <PenLine className="size-4 text-blue-600" />
                        <span className="font-medium">My writing</span>
                      </div>
                      <span className="text-xs leading-4">
                        Submit your own writing samples
                      </span>
                    </button>
                    <button className="transition text-left rounded-xl border-black/1 border-1 border-solid p-4">
                      <div className="flex mb-2 items-center gap-2">
                        <BookOpen className="size-4 text-blue-600" />
                        <span className="font-medium">A writer's style</span>
                      </div>
                      <span className="text-xs leading-4">
                        Emulate a known writer
                      </span>
                    </button>
                  </div>
                  <div className="flex justify-end">
                    <Button className="bg-blue-600 text-white gap-2">
                      Next
                      <ArrowRight className="size-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
