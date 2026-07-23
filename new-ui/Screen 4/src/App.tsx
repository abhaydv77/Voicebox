import { useEffect } from "react";
import {
  ArrowLeft,
  Copy,
  MoonStar,
  Save,
  Send,
  Settings,
  Sparkles,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

export default function App() {
  return (
    <div>
      <div className="font-sans bg-white text-neutral-950 w-full h-fit h-fit min-h-screen w-screen min-w-screen max-w-screen overflow-visible">
        <div className="min-h-screen bg-white text-neutral-950 flex flex-col">
          <header className="shrink-0 backdrop-blur bg-white/95 border-neutral-200 border-t-0 border-r-0 border-b-1 border-l-0 border-solid">
            <div className="max-w-[1140px] flex mx-auto px-6 justify-between items-center w-full h-16">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-9 rounded-full"
                >
                  <ArrowLeft className="size-5" />
                </Button>
                <div className="flex items-center gap-3">
                  <span className="size-8 font-semibold rounded-full bg-blue-600 text-white text-sm leading-5 flex justify-center items-center">
                    M
                  </span>
                  <h1 className="truncate font-semibold text-base leading-6">
                    My LinkedIn Voice
                  </h1>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm">
                  <Sparkles className="size-4" />
                  Show draft
                </Button>
                <Button size="sm" variant="outline">
                  <MoonStar className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-9 rounded-full"
                >
                  <Settings className="size-5" />
                </Button>
              </div>
            </div>
          </header>
          <div>
            <div className="max-w-[1140px] flex mx-auto px-6 flex-col w-full h-full">
              <div className="overflow-y-auto py-8 flex-1">
                <div className="max-w-3xl flex mx-auto flex-col gap-8 w-full">
                  <div className="flex justify-end">
                    <div className="max-w-[80%] flex flex-col items-end gap-1">
                      <div>
                        <p className="text-sm leading-6">
                          What would be a good topic to explore in my next post?
                        </p>
                      </div>
                      <span>10:24 AM</span>
                    </div>
                  </div>
                  <div className="flex justify-start">
                    <div className="max-w-[85%] flex flex-col items-start gap-1">
                      <Card>
                        <Button variant="ghost" size="icon">
                          <Copy />
                        </Button>
                        <CardContent className="pl-0 pr-8 py-0 gap-3">
                          <p className="text-sm leading-6">
                            Honestly? Talk about the messy middle. Everyone
                            posts about the wins and the launch days, but the
                            real story lives in the 3am doubts and the pivots
                            nobody saw. That's the stuff people actually stop
                            scrolling for.
                          </p>
                          <Separator className="hidden" />
                          <p className="hidden">
                            You could write about the challenges you faced
                            during the process. Sharing difficulties can be
                            relatable to your audience.
                          </p>
                        </CardContent>
                      </Card>
                      <span>10:24 AM</span>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <div className="max-w-[80%] flex flex-col items-end gap-1">
                      <div>
                        <p className="text-sm leading-6">
                          I like that. Can you make it sound more confident?
                        </p>
                      </div>
                      <span>10:26 AM</span>
                    </div>
                  </div>
                  <div className="flex justify-start">
                    <div className="max-w-[85%] flex flex-col items-start gap-1">
                      <Card>
                        <Button variant="ghost" size="icon">
                          <Copy />
                        </Button>
                        <CardContent className="pl-0 pr-8 py-0 gap-3">
                          <p className="text-sm leading-6">
                            Here's the truth nobody tells you: your best content
                            is hiding in the parts you're tempted to edit out.
                            The doubts. The pivots. The 3am rewrites. Post that.
                            Watch what happens.
                          </p>
                          <Separator className="hidden" />
                          <p className="hidden">
                            Your most engaging content often comes from sharing
                            the difficult parts of your journey, such as doubts
                            and revisions.
                          </p>
                        </CardContent>
                      </Card>
                      <span>10:26 AM</span>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <div className="max-w-3xl flex mx-auto flex-col gap-3 w-full">
                  <div className="flex items-center gap-2">
                    <span>Tone:</span>
                    <Button size="sm">Casual</Button>
                    <Button size="sm">Professional</Button>
                    <Button size="sm">Witty</Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input placeholder="Type your idea..." value="" />
                    <Button className="bg-blue-600 text-white gap-2">
                      <Send className="size-4" />
                      Send
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <Dialog>
            <DialogContent>
              <DialogHeader className="p-0 gap-2">
                <DialogTitle>Voice settings</DialogTitle>
                <DialogDescription>
                  Rename or delete this voice profile.
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-2">
                <label className="font-medium text-sm leading-5">
                  Voice name
                </label>
                <div className="flex items-center gap-2">
                  <Input value="My LinkedIn Voice" />
                  <Button className="bg-blue-600 text-white gap-2">
                    <Save className="size-4" />
                    Save
                  </Button>
                </div>
              </div>
              <Separator />
              <div>
                <div className="flex flex-col gap-1">
                  <span className="font-medium text-red-600 text-sm leading-5">
                    Delete voice
                  </span>
                  <span>
                    Type "My LinkedIn Voice" to confirm. This cannot be undone.
                  </span>
                </div>
                <Input value="" />
                <Button variant="destructive" className="gap-2">
                  <Trash2 className="size-4" />
                  Delete voice
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
