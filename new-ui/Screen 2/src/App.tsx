import { useEffect } from "react";
import { LogOut, Plus, Sparkles, TriangleAlert, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function App() {
  return (
    <div>
      <div className="bg-white text-neutral-950 w-full h-fit h-fit min-h-screen w-screen min-w-screen max-w-screen overflow-visible">
        <div>
          <header>
            <div className="flex px-8 justify-between items-center h-full">
              <div className="flex items-center gap-2">
                <div className="size-8 rounded-lg bg-blue-600 text-white flex justify-center items-center">
                  <Sparkles className="size-4" />
                </div>
                <span>VoiceBox</span>
              </div>
              <div className="flex items-center gap-4">
                <div>
                  <User className="size-4" />
                  <span>alex.morgan@example.com</span>
                </div>
                <div>
                  <span>Theme</span>
                  <button>
                    <span />
                  </button>
                </div>
                <Button variant="outline" size="sm">
                  <LogOut className="size-4" />
                  Sign Out
                </Button>
              </div>
            </div>
          </header>
          <main>
            <div className="flex mb-6 justify-between items-center">
              <div className="flex flex-col gap-1">
                <h1>Your Voices</h1>
                <p>Voice profiles that write like you.</p>
              </div>
              <div>
                <button>Voices</button>
                <button>Empty</button>
              </div>
            </div>
            <div>
              <TriangleAlert />
              <div className="flex flex-col gap-0.5">
                <p>Couldn't load your voices</p>
                <p>
                  Failed to fetch GET /api/voicebox/voices. Please try again.
                </p>
              </div>
              <Button variant="ghost" size="sm">
                Retry
              </Button>
            </div>
            <div className="grid grid-cols-4 gap-6">
              <Card>
                <CardContent className="flex p-0 flex-col gap-4">
                  <div className="size-12 font-semibold rounded-full bg-blue-100 text-blue-700 text-lg leading-7 flex justify-center items-center">
                    L
                  </div>
                  <div className="flex flex-col gap-2">
                    <p>LinkedIn Voice</p>
                    <span>Own writing</span>
                    <p>Created Jan 12, 2025</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex p-0 flex-col gap-4">
                  <div className="size-12 font-semibold rounded-full bg-green-100 text-green-700 text-lg leading-7 flex justify-center items-center">
                    N
                  </div>
                  <div className="flex flex-col gap-2">
                    <p>Naval Ravikant Style</p>
                    <span>Writer style</span>
                    <p>Created Jan 9, 2025</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex p-0 flex-col gap-4">
                  <div className="size-12 font-semibold rounded-full bg-purple-100 text-purple-700 text-lg leading-7 flex justify-center items-center">
                    T
                  </div>
                  <div className="flex flex-col gap-2">
                    <p>Twitter Threads And Hot Takes</p>
                    <span>Own writing</span>
                    <p>Created Jan 5, 2025</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex p-0 flex-col gap-4">
                  <div className="size-12 font-semibold rounded-full bg-orange-100 text-orange-700 text-lg leading-7 flex justify-center items-center">
                    P
                  </div>
                  <div className="flex flex-col gap-2">
                    <p>Paul Graham Style</p>
                    <span>Writer style</span>
                    <p>Created Dec 28, 2024</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex p-0 flex-col gap-4">
                  <div className="size-12 font-semibold rounded-full bg-blue-100 text-blue-700 text-lg leading-7 flex justify-center items-center">
                    M
                  </div>
                  <div className="flex flex-col gap-2">
                    <p>Marketing Newsletter</p>
                    <span>Own writing</span>
                    <p>Created Dec 20, 2024</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex p-0 flex-col gap-4">
                  <div className="size-12 font-semibold rounded-full bg-green-100 text-green-700 text-lg leading-7 flex justify-center items-center">
                    C
                  </div>
                  <div className="flex flex-col gap-2">
                    <p>Casual Blog Voice</p>
                    <span>Own writing</span>
                    <p>Created Dec 14, 2024</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex p-0 flex-col gap-4">
                  <div className="size-12 font-semibold rounded-full bg-purple-100 text-purple-700 text-lg leading-7 flex justify-center items-center">
                    D
                  </div>
                  <div className="flex flex-col gap-2">
                    <p>David Perell Style</p>
                    <span>Writer style</span>
                    <p>Created Dec 2, 2024</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <div className="flex py-2 flex-col justify-center items-center gap-2">
                  <div>
                    <Plus className="size-5" />
                  </div>
                  <p>Add Voice</p>
                </div>
              </Card>
            </div>
            <div className="text-center hidden py-24 flex-col justify-center items-center gap-4">
              <div>
                <Plus className="size-8" />
              </div>
              <div className="flex flex-col gap-1">
                <h2>No voices yet</h2>
                <p>
                  Create your first voice profile so VoiceBox can write in your
                  style.
                </p>
              </div>
              <Button className="bg-blue-600 text-white gap-2">
                <Plus className="size-4" />
                Create Voice Profile
              </Button>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
