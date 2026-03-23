import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Editor } from "@monaco-editor/react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Users, 
  MessageSquare, 
  Video, 
  Mic, 
  MicOff, 
  VideoOff, 
  Share2, 
  Code2, 
  Terminal,
  Play
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function CollaborationPage() {
  const [code, setCode] = useState("// Write some code and click Run Code\nconsole.log('Hello from Intervue!');");
  const [language, setLanguage] = useState("javascript");
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [participants] = useState([
    { id: "1", name: "You", isSelf: true, color: "bg-blue-500" }
  ]);
  const [output, setOutput] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let stream: MediaStream | null = null;
    
    async function setupMedia() {
      if (isVideoOn || isMicOn) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({ 
            video: isVideoOn, 
            audio: isMicOn 
          });
          if (videoRef.current) {
            videoRef.current.srcObject = isVideoOn ? stream : null;
          }
        } catch (err) {
          console.error("Error accessing media devices:", err);
          toast.error("Could not access camera/microphone. Please check permissions.");
        }
      } else {
        if (videoRef.current) {
          videoRef.current.srcObject = null;
        }
      }
    }

    setupMedia();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isVideoOn, isMicOn]);

  const handleRunCode = () => {
    if (language !== "javascript" && language !== "typescript") {
      setOutput(`Running ${language} code...\nNo execution engine connected in this environment for ${language}.`);
      return;
    }
    
    setOutput("Running code...\n");
    const originalLog = console.log;
    const logs: string[] = [];
    console.log = (...args) => logs.push(args.map(String).join(" "));
    
    try {
      // eslint-disable-next-line no-eval
      eval(code);
      setOutput(prev => prev + (logs.length > 0 ? logs.join("\n") : "Code executed successfully (no output)."));
    } catch (err: any) {
      setOutput(prev => prev + `Error: ${err.message}`);
    } finally {
      console.log = originalLog;
    }
  };

  const handleInvite = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Invite link copied to clipboard!");
  };

  const handleEndSession = () => {
    if (window.confirm("Are you sure you want to end this practice session?")) {
      navigate("/generate");
    }
  };

  return (
    <div className="h-[calc(100-2rem)] flex flex-col gap-4 p-4 lg:p-6 bg-slate-900 text-slate-100">
      <header className="flex items-center justify-between pb-4 border-b border-slate-700">
        <div className="flex items-center gap-4">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Code2 size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold">Industry Practice Session</h1>
            <p className="text-sm text-slate-400 flex items-center gap-1">
              <Users size={14} /> 2 Participants Active
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-emerald-400 border-emerald-400 animate-pulse">
            ● LIVE COLLAB
          </Badge>
          <Button onClick={handleInvite} variant="outline" size="sm" className="gap-2 text-slate-900">
            <Share2 size={16} /> Invite
          </Button>
          <Button onClick={handleEndSession} size="sm" className="bg-blue-600 hover:bg-blue-700">
            End Session
          </Button>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 overflow-hidden">
        {/* Main Coding Area */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <Card className="flex-1 bg-slate-950 border-slate-800 overflow-hidden flex flex-col">
            <CardHeader className="py-3 px-4 flex flex-row items-center justify-between bg-slate-900 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <select 
                  value={language} 
                  onChange={(e) => setLanguage(e.target.value)}
                  className="bg-slate-800 text-xs text-slate-300 border-none rounded px-2 py-1 outline-none"
                >
                  <option value="javascript">JavaScript</option>
                  <option value="typescript">TypeScript</option>
                  <option value="python">Python</option>
                  <option value="java">Java</option>
                </select>
              </div>
              <Button onClick={handleRunCode} size="sm" className="h-8 gap-2 bg-emerald-600 hover:bg-emerald-700">
                <Play size={14} /> Run Code
              </Button>
            </CardHeader>
            <CardContent className="p-0 flex-1 relative">
              <Editor
                height="100%"
                language={language}
                theme="vs-dark"
                value={code}
                onChange={(val) => setCode(val || "")}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: "on",
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                }}
              />
              <AnimatePresence>
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute bottom-4 right-4 bg-slate-800 text-white p-2 rounded-full shadow-lg flex gap-1"
                >
                  {participants.map(p => (
                    <div key={p.id} className={`w-8 h-8 rounded-full ${p.color} flex items-center justify-center border-2 border-slate-900 text-xs font-bold`}>
                      {p.name[0]}
                    </div>
                  ))}
                </motion.div>
              </AnimatePresence>
            </CardContent>
          </Card>

          {/* Terminal / Output */}
          <Card className="h-40 bg-slate-950 border-slate-800">
            <CardHeader className="py-2 px-4 border-b border-slate-800 flex flex-row items-center gap-2">
              <Terminal size={14} className="text-slate-400" />
              <CardTitle className="text-xs font-medium text-slate-400">Terminal Output</CardTitle>
            </CardHeader>
            <CardContent className="p-4 font-mono text-sm text-slate-300">
              {output || "No output to show. Click 'Run Code' to execute."}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Video & Chat */}
        <div className="flex flex-col gap-4">
          {/* Video Feed */}
          <div className="grid grid-cols-1 gap-2">
            {participants.map((p) => (
              <div key={p.id} className="relative aspect-video bg-slate-800 rounded-xl overflow-hidden shadow-lg border border-slate-700">
                {!isVideoOn && p.isSelf ? (
                   <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
                     <div className={`w-12 h-12 rounded-full ${p.color} flex items-center justify-center text-xl font-bold`}>
                       {p.name[0]}
                     </div>
                   </div>
                ) : (
                  <div className="absolute inset-0 bg-slate-950">
                    <video 
                      ref={p.isSelf ? videoRef : null} 
                      autoPlay 
                      playsInline 
                      muted={p.isSelf}
                      className="w-full h-full object-cover"
                    />
                    {!p.isSelf && (
                      <div className="absolute inset-0 flex items-center justify-center italic text-slate-600">
                        Remote Feed
                      </div>
                    )}
                  </div>
                )}
                <div className="absolute bottom-2 left-2 flex items-center gap-2">
                   <Badge variant="secondary" className="bg-black/50 text-white border-none py-0.5 px-2 text-[10px]">
                     {p.name}
                   </Badge>
                   {!isMicOn && p.isSelf && <MicOff size={12} className="text-red-500" />}
                </div>
              </div>
            ))}
          </div>

          {/* Controls */}
          <div className="flex justify-center gap-3 py-2">
            <Button 
              variant={isMicOn ? "outline" : "destructive"} 
              size="icon" 
              className="rounded-full"
              onClick={() => setIsMicOn(!isMicOn)}
            >
              {isMicOn ? <Mic size={20} className="text-slate-900" /> : <MicOff size={20} />}
            </Button>
            <Button 
              variant={isVideoOn ? "outline" : "destructive"} 
              size="icon" 
              className="rounded-full"
              onClick={() => setIsVideoOn(!isVideoOn)}
            >
              {isVideoOn ? <Video size={20} className="text-slate-900" /> : <VideoOff size={20} />}
            </Button>
            <Button variant="outline" size="icon" className="rounded-full">
              <MessageSquare size={20} className="text-slate-900" />
            </Button>
          </div>

          <Separator className="bg-slate-800" />

          {/* Task Info */}
          <Card className="bg-slate-900 border-slate-800 text-slate-300">
            <CardHeader className="py-3">
              <CardTitle className="text-sm font-semibold">Shared Task</CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-2">
              <p>Implement a function that reverses a linked list in-place.</p>
              <div className="bg-blue-900/30 p-2 rounded border border-blue-900 text-blue-300">
                Tip: Remember to keep track of the next and previous nodes as you traverse.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
