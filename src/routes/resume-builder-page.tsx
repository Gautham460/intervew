import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Download, 
  User, 
  Briefcase, 
  Wrench, 
  Plus, 
  Trash2,
  GraduationCap,
  Globe,
  Github,
  Linkedin,
  Mail,
  Phone,
  Layout,
  ExternalLink,
  Sparkles,
  Target,
  BrainCircuit,
  TrendingUp,
  AlertCircle,
  FileText,
  Zap
} from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { motion, AnimatePresence } from "framer-motion";
import { analyzeResume, type ResumeAnalysis } from "@/lib/resume-analysis";
import { toast } from "sonner";

export default function ResumeBuilderPage() {
  const resumeRef = useRef<HTMLDivElement>(null);
  
  const [profile, setProfile] = useState({
    name: "",
    title: "",
    email: "",
    phone: "",
    location: "",
    summary: "",
    github: "",
    linkedin: "",
    website: "",
  });

  const [experience, setExperience] = useState<{ id: number; company: string; role: string; period: string; desc: string }[]>([]);
  const [education, setEducation] = useState<{ id: number; school: string; degree: string; period: string }[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [targetRole, setTargetRole] = useState("");
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<ResumeAnalysis | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);

  const addExperience = () => setExperience([...experience, { id: Date.now(), company: "", role: "", period: "", desc: "" }]);
  const addEducation = () => setEducation([...education, { id: Date.now(), school: "", degree: "", period: "" }]);

  const removeItem = (id: number, type: 'exp' | 'edu') => {
    if (type === 'exp') setExperience(experience.filter(e => e.id !== id));
    if (type === 'edu') setEducation(education.filter(e => e.id !== id));
  };

  const generateTextVersion = () => {
    let text = `Name: ${profile.name}\nTitle: ${profile.title}\nSummary: ${profile.summary}\n\n`;
    text += "EXPERIENCE:\n";
    experience.forEach(exp => {
      text += `${exp.role} at ${exp.company} (${exp.period})\n${exp.desc}\n\n`;
    });
    text += "EDUCATION:\n";
    education.forEach(edu => {
      text += `${edu.degree} from ${edu.school} (${edu.period})\n\n`;
    });
    text += "SKILLS:\n" + skills.join(", ");
    return text;
  };

  const handleAIAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const resumeText = generateTextVersion();
      const result = await analyzeResume(resumeText, targetRole);
      setAnalysisResult(result);
      setShowAnalysis(true);
      toast.success("AI Analysis Complete!");
    } catch (error) {
      console.error(error);
      toast.error("Analysis failed. Please check your API key.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const downloadPDF = async () => {
    if (!resumeRef.current) return;
    try {
      const canvas = await html2canvas(resumeRef.current, { 
        scale: 2, 
        useCORS: true, 
        logging: false,
        backgroundColor: '#ffffff'
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${profile.name.replace(/\s+/g, "_") || "My"}_Resume.pdf`);
    } catch (err) {
      console.error(err);
      toast.error("Export failed");
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-500";
    if (score >= 60) return "text-amber-500";
    return "text-rose-500";
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 p-6 bg-slate-50 min-h-screen">
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="lg:w-2/5 space-y-6 overflow-y-auto lg:h-[calc(100vh-100px)] pr-2"
      >
        <header className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Resume Architect</h1>
            <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-600 border-blue-100 uppercase tracking-tighter">v1.2</Badge>
          </div>
          <p className="text-slate-500">Premium ATS-optimized career blueprints.</p>
        </header>

        {/* AI Analysis Tool */}
        <Card className="border-blue-100 bg-blue-50/50 shadow-sm overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-10"><BrainCircuit size={80} /></div>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2 text-blue-600 mb-1">
              <Sparkles size={18} />
              <CardTitle className="text-sm font-bold uppercase tracking-wider">AI Career Optimizer</CardTitle>
            </div>
            <CardDescription className="text-blue-700/70 font-medium">Get instant feedback & ATS score for your current draft.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input 
                placeholder="Target Role (e.g. Frontend Engineer)" 
                className="bg-white border-blue-200" 
                value={targetRole}
                onChange={e => setTargetRole(e.target.value)}
              />
              <Button 
                onClick={handleAIAnalysis} 
                disabled={isAnalyzing || !profile.name}
                className="bg-blue-600 hover:bg-blue-700 text-white shrink-0"
              >
                {isAnalyzing ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}><Sparkles size={16} /></motion.div> : <BrainCircuit size={16} className="mr-2" />}
                Analyze
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Info Dialog for Analysis */}
        <Dialog open={showAnalysis} onOpenChange={setShowAnalysis}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white border-none shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black flex items-center gap-2">
                <Sparkles className="text-blue-500" /> AI Resume Insight
              </DialogTitle>
              <DialogDescription>
                Analysis based on modern ATS algorithms and tech industry standards.
              </DialogDescription>
            </DialogHeader>
            
            {analysisResult && (
              <div className="space-y-6 py-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "Overall", score: analysisResult.overallScore, icon: <Target className="text-blue-500" /> },
                    { label: "ATS Readiness", score: analysisResult.atsScore, icon: <Zap className="text-amber-500" /> },
                    { label: "Content", score: analysisResult.contentScore, icon: <FileText className="text-emerald-500" /> },
                    { label: "Keywords", score: analysisResult.keywordScore, icon: <Wrench className="text-purple-500" /> },
                  ].map((stat, i) => (
                    <motion.div 
                      key={stat.label}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="p-4 bg-slate-50 rounded-2xl border text-center"
                    >
                      <div className="flex justify-center mb-2">{stat.icon}</div>
                      <div className={`text-2xl font-black ${getScoreColor(stat.score)}`}>{stat.score}%</div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</div>
                    </motion.div>
                  ))}
                </div>

                <div className="space-y-4">
                  <div className="p-5 bg-emerald-50/50 rounded-2xl border border-emerald-100">
                    <h4 className="text-sm font-bold text-emerald-800 flex items-center gap-2 mb-3"><TrendingUp size={16} /> Key Strengths</h4>
                    <ul className="space-y-2">
                      {analysisResult.strengths.map((s, i) => (
                        <li key={i} className="text-xs text-emerald-700 flex items-start gap-2">
                          <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-5 bg-amber-50/50 rounded-2xl border border-amber-100">
                    <h4 className="text-sm font-bold text-amber-800 flex items-center gap-2 mb-3"><AlertCircle size={16} /> Critical Improvements</h4>
                    <ul className="space-y-2">
                      {analysisResult.improvements.map((im, i) => (
                        <li key={i} className="text-xs text-amber-700 flex items-start gap-2">
                          <span className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
                          {im}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-5 bg-slate-50 rounded-2xl border">
                    <h4 className="text-sm font-bold text-slate-800 mb-3">Recommended Keywords</h4>
                    <div className="flex flex-wrap gap-2">
                      {analysisResult.missingKeywords.map((k, i) => (
                        <Badge key={i} variant="outline" className="bg-white text-slate-600 border-slate-200">+{k}</Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <Button className="w-full bg-slate-900 py-6" onClick={() => setShowAnalysis(false)}>Continue Editing</Button>
              </div>
            )}
          </DialogContent>
        </Dialog>

        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center gap-2 pb-3">
            <div className="p-1.5 bg-blue-50 rounded-lg text-blue-600"><User size={18} /></div>
            <CardTitle className="text-lg">Contact Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input placeholder="Full Name" value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} />
            <Input placeholder="Title" value={profile.title} onChange={e => setProfile({...profile, title: e.target.value})} />
            <div className="grid grid-cols-2 gap-4">
              <Input placeholder="Email" value={profile.email} onChange={e => setProfile({...profile, email: e.target.value})} />
              <Input placeholder="Phone" value={profile.phone} onChange={e => setProfile({...profile, phone: e.target.value})} />
            </div>
            <Input placeholder="Location" value={profile.location} onChange={e => setProfile({...profile, location: e.target.value})} />
            <div className="grid grid-cols-3 gap-2">
              <Input placeholder="LinkedIn" className="h-8 text-xs" value={profile.linkedin} onChange={e => setProfile({...profile, linkedin: e.target.value})} />
              <Input placeholder="GitHub" className="h-8 text-xs" value={profile.github} onChange={e => setProfile({...profile, github: e.target.value})} />
              <Input placeholder="Website" className="h-8 text-xs" value={profile.website} onChange={e => setProfile({...profile, website: e.target.value})} />
            </div>
            <Textarea placeholder="Summary" className="min-h-[100px]" value={profile.summary} onChange={e => setProfile({...profile, summary: e.target.value})} />
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div className="flex items-center gap-2"><div className="p-1.5 bg-indigo-50 rounded-lg text-indigo-600"><Briefcase size={18} /></div><CardTitle className="text-lg">Experience</CardTitle></div>
            <Button size="sm" variant="outline" onClick={addExperience} className="h-8 text-[10px] font-black uppercase"><Plus size={14} className="mr-1" /> Add Job</Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <AnimatePresence>
              {experience.map((exp, idx) => (
                <motion.div 
                  key={exp.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-4 border rounded-xl bg-slate-50 relative group mb-4"
                >
                  <Button onClick={() => removeItem(exp.id, 'exp')} className="absolute -right-2 -top-2 h-7 w-7 bg-white rounded-full border opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center shadow-sm hover:bg-red-50 hover:text-red-500" variant="ghost" size="icon"><Trash2 size={14} /></Button>
                  <div className="grid grid-cols-2 gap-3 mb-2">
                    <Input placeholder="Company" value={exp.company} onChange={e => setExperience(experience.map((it, i) => i === idx ? {...it, company: e.target.value} : it))} />
                    <Input placeholder="Period" value={exp.period} onChange={e => setExperience(experience.map((it, i) => i === idx ? {...it, period: e.target.value} : it))} />
                  </div>
                  <Input placeholder="Role" className="mb-2" value={exp.role} onChange={e => setExperience(experience.map((it, i) => i === idx ? {...it, role: e.target.value} : it))} />
                  <Textarea placeholder="Details (Standard resume bullet points recommended)" value={exp.desc} onChange={e => setExperience(experience.map((it, i) => i === idx ? {...it, desc: e.target.value} : it))} />
                </motion.div>
              ))}
            </AnimatePresence>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div className="flex items-center gap-2"><div className="p-1.5 bg-emerald-50 rounded-lg text-emerald-600"><GraduationCap size={18} /></div><CardTitle className="text-lg">Education</CardTitle></div>
            <Button size="sm" variant="outline" onClick={addEducation} className="h-8 text-[10px] font-black uppercase"><Plus size={14} className="mr-1" /> Add</Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <AnimatePresence>
              {education.map((edu, idx) => (
                <motion.div 
                  key={edu.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-4 border rounded-xl bg-slate-50 relative group mb-4"
                >
                  <Button onClick={() => removeItem(edu.id, 'edu')} className="absolute -right-2 -top-2 h-7 w-7 bg-white rounded-full border opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center shadow-sm hover:bg-red-50 hover:text-red-500" variant="ghost" size="icon"><Trash2 size={14} /></Button>
                  <Input placeholder="School" className="mb-2 text-xs" value={edu.school} onChange={e => setEducation(education.map((it, i) => i === idx ? {...it, school: e.target.value} : it))} />
                  <div className="grid grid-cols-2 gap-2">
                    <Input placeholder="Degree" className="text-xs" value={edu.degree} onChange={e => setEducation(education.map((it, i) => i === idx ? {...it, degree: e.target.value} : it))} />
                    <Input placeholder="Period" className="text-xs" value={edu.period} onChange={e => setEducation(education.map((it, i) => i === idx ? {...it, period: e.target.value} : it))} />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center gap-2 pb-3"><div className="p-1.5 bg-purple-50 rounded-lg text-purple-600"><Wrench size={18} /></div><CardTitle className="text-lg">Skills</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 mb-4">
              <AnimatePresence>
                {skills.map((s, idx) => (
                  <motion.div
                    key={`${s}-${idx}`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                  >
                    <Badge variant="secondary" className="gap-2 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700">
                      {s}
                      <button onClick={() => setSkills(skills.filter((_, i) => i !== idx))} className="hover:text-red-500 transition-colors">
                        <Trash2 size={10} />
                      </button>
                    </Badge>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            <div className="flex gap-2">
              <Input 
                placeholder="Add a skill..." 
                className="h-9" 
                value={newSkill} 
                onChange={e => setNewSkill(e.target.value)} 
                onKeyDown={e => { 
                  if (e.key === 'Enter' && newSkill.trim()) { 
                    setSkills([...skills, newSkill.trim()]); 
                    setNewSkill(""); 
                  } 
                }} 
              />
              <Button size="sm" onClick={() => { if (newSkill.trim()) { setSkills([...skills, newSkill.trim()]); setNewSkill(""); } }}>Add</Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="lg:w-3/5 flex justify-center bg-slate-200/50 py-12 rounded-2xl border-2 border-dashed border-slate-300 relative overflow-hidden h-[calc(100vh-100px)] overflow-y-auto">
        <div className="max-w-[800px] w-full px-4">
          <div className="sticky top-0 z-10 flex items-center justify-between mb-8 bg-white/80 backdrop-blur-md p-4 rounded-xl shadow-xl border border-white/50">
            <h2 className="flex items-center gap-2 text-lg font-bold"><Layout size={20} className="text-blue-600" /> Professional Preview</h2>
            <Button onClick={downloadPDF} className="bg-slate-900 hover:bg-slate-800 text-white gap-2 font-bold px-6 uppercase text-xs tracking-widest transition-all shadow-lg active:scale-95">
              <Download size={16} /> Download PDF
            </Button>
          </div>
          
          <div className="bg-white shadow-2xl mx-auto overflow-hidden">
            <div 
              ref={resumeRef} 
              className="w-[210mm] min-h-[297mm] bg-white p-[20mm] text-slate-900 relative flex flex-col" 
              style={{ boxSizing: 'border-box' }}
            >
              {/* Header */}
              <div className="border-b-4 border-slate-900 pb-8 mb-10 text-center relative">
                <h1 className="text-4xl font-black uppercase mb-2 tracking-tight">{profile.name || "YOUR NAME"}</h1>
                <p className="text-base font-bold text-blue-600 uppercase tracking-[0.3em] mb-6">{profile.title || "PROFESSIONAL TITLE"}</p>
                <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-[10px] uppercase font-bold text-slate-500">
                  {profile.email && <span className="flex items-center gap-1.5"><Mail size={12} className="text-slate-900"/>{profile.email}</span>}
                  {profile.phone && <span className="flex items-center gap-1.5"><Phone size={12} className="text-slate-900"/>{profile.phone}</span>}
                  {profile.location && <span className="flex items-center gap-1.5"><Globe size={12} className="text-slate-900"/>{profile.location}</span>}
                  {profile.linkedin && <span className="flex items-center gap-1.5"><Linkedin size={12} className="text-slate-900"/>{profile.linkedin}</span>}
                  {profile.github && <span className="flex items-center gap-1.5"><Github size={12} className="text-slate-900"/>{profile.github}</span>}
                  {profile.website && <span className="flex items-center gap-1.5"><ExternalLink size={12} className="text-slate-900"/>{profile.website}</span>}
                </div>
              </div>

              {/* Summary */}
              {profile.summary && (
                <section className="mb-10">
                  <h2 className="text-xs font-black uppercase tracking-[0.3em] border-b-2 border-slate-100 pb-2 mb-4 text-slate-900">Professional Summary</h2>
                  <p className="text-[11px] leading-relaxed text-slate-700 text-justify">{profile.summary}</p>
                </section>
              )}

              {/* Skills / Languages & Tools */}
              <section className="mb-10">
                <h2 className="text-xs font-black uppercase tracking-[0.3em] border-b-2 border-slate-100 pb-2 mb-4 text-slate-900">Languages & Tools:</h2>
                <div className="flex flex-wrap gap-2">
                  {skills.length > 0 ? (
                    skills.map((s, idx) => (
                      <span key={idx} className="text-[10px] font-bold px-2 py-0.5 bg-slate-50 text-slate-700 border border-slate-200">
                        {s}
                      </span>
                    ))
                  ) : (
                    <span className="text-[10px] text-slate-400 italic">Add your technical skills...</span>
                  )}
                </div>
              </section>

              <div className="grid grid-cols-1 gap-10">
                {/* Experience */}
                {experience.length > 0 && (
                  <section>
                    <h2 className="text-xs font-black uppercase tracking-[0.3em] border-b-2 border-slate-100 pb-2 mb-6 text-slate-900">Work Experience</h2>
                    <div className="space-y-8">
                      {experience.map(exp => (
                        <div key={exp.id} className="relative">
                          <div className="flex justify-between items-baseline mb-1">
                            <h3 className="text-sm font-black uppercase tracking-tight">{exp.company || "Company Name"}</h3>
                            <span className="text-[9px] font-black text-slate-400 bg-slate-50 px-2 py-0.5">{exp.period || "Period"}</span>
                          </div>
                          <p className="text-[10px] font-bold text-blue-600 mb-3 uppercase tracking-widest">{exp.role || "Job Role"}</p>
                          <p className="text-[10px] text-slate-600 leading-relaxed whitespace-pre-wrap">{exp.desc || "Responsibility details..."}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Education */}
                {education.length > 0 && (
                  <section>
                    <h2 className="text-xs font-black uppercase tracking-[0.3em] border-b-2 border-slate-100 pb-2 mb-6 text-slate-900">Education</h2>
                    <div className="space-y-6">
                      {education.map(edu => (
                        <div key={edu.id}>
                          <div className="flex justify-between items-baseline mb-1">
                            <h3 className="text-sm font-black uppercase tracking-tight">{edu.school || "Institution name"}</h3>
                            <span className="text-[9px] font-black text-slate-400 bg-slate-50 px-2 py-0.5">{edu.period || "Graduation Date"}</span>
                          </div>
                          <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">{edu.degree || "Degree Title"}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </div>

              {/* Footer */}
              <div className="mt-auto pt-10 flex justify-between items-center opacity-30">
                <span className="text-[8px] font-black uppercase tracking-[0.4em]">ATS Optimized Blueprint</span>
                <div className="h-[1px] flex-grow mx-4 bg-slate-200"></div>
                <span className="text-[8px] font-black uppercase tracking-[0.4em]">Intervue AI</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
