import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Download, 
  User, 
  Briefcase, 
  Wrench, 
  Plus, 
  Trash2,
  Eye,
  CheckCircle2
} from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function ResumeBuilderPage() {
  const resumeRef = useRef<HTMLDivElement>(null);
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    summary: "",
  });

  const [experience, setExperience] = useState<{ id: number, company: string, role: string, period: string, desc: string }[]>([]);

  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");

  const downloadPDF = async () => {
    if (!resumeRef.current) return;
    const canvas = await html2canvas(resumeRef.current, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${profile.name.replace(" ", "_")}_Resume.pdf`);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 p-6 bg-slate-50 min-h-screen">
      {/* Editor Sidebar */}
      <div className="lg:w-1/2 space-y-6">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Resume Builder</h1>
          <p className="text-slate-500">Create an ATS-optimized resume in minutes.</p>
        </header>

        {/* Profile Info */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center gap-2">
            <User className="text-blue-600" size={20} />
            <CardTitle className="text-lg">Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input 
                placeholder="Full Name" 
                value={profile.name} 
                onChange={e => setProfile({...profile, name: e.target.value})} 
              />
              <Input 
                placeholder="Email" 
                value={profile.email} 
                onChange={e => setProfile({...profile, email: e.target.value})} 
              />
            </div>
            <Input 
              placeholder="Phone Number" 
              value={profile.phone} 
              onChange={e => setProfile({...profile, phone: e.target.value})} 
            />
            <Textarea 
              placeholder="Professional Summary" 
              value={profile.summary} 
              onChange={e => setProfile({...profile, summary: e.target.value})} 
            />
          </CardContent>
        </Card>

        {/* Experience Section */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <Briefcase className="text-blue-600" size={20} />
              <CardTitle className="text-lg">Work Experience</CardTitle>
            </div>
            <Button size="sm" variant="ghost" className="text-blue-600 hover:text-blue-700">
              <Plus size={16} /> Add
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            {experience.map((exp, idx) => (
              <div key={exp.id} className="p-4 border rounded-lg relative hover:border-blue-200 transition-colors">
                <Button className="absolute right-2 top-2 h-8 w-8 text-slate-400 hover:text-red-500" variant="ghost" size="icon">
                  <Trash2 size={16} />
                </Button>
                <div className="grid grid-cols-2 gap-4 mb-2">
                  <Input 
                    value={exp.company} 
                    onChange={e => {
                      const newExp = [...experience];
                      newExp[idx].company = e.target.value;
                      setExperience(newExp);
                    }} 
                  />
                  <Input 
                    value={exp.period} 
                    onChange={e => {
                      const newExp = [...experience];
                      newExp[idx].period = e.target.value;
                      setExperience(newExp);
                    }} 
                  />
                </div>
                <Input 
                  className="mb-2" 
                  value={exp.role} 
                  onChange={e => {
                    const newExp = [...experience];
                    newExp[idx].role = e.target.value;
                    setExperience(newExp);
                  }} 
                />
                <Textarea 
                  value={exp.desc} 
                  onChange={e => {
                    const newExp = [...experience];
                    newExp[idx].desc = e.target.value;
                    setExperience(newExp);
                  }} 
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Skills */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center gap-2">
            <Wrench className="text-blue-600" size={20} />
            <CardTitle className="text-lg">Skills</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 mb-4">
              {skills.map((skill, idx) => (
                <div key={idx} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full flex items-center gap-2 group">
                  <span className="text-sm font-medium">{skill}</span>
                  <button className="text-blue-300 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input 
                placeholder="Add a skill..." 
                className="h-9" 
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newSkill.trim()) {
                    setSkills([...skills, newSkill.trim()]);
                    setNewSkill("");
                  }
                }}
              />
              <Button 
                size="sm" 
                onClick={() => {
                  if (newSkill.trim()) {
                    setSkills([...skills, newSkill.trim()]);
                    setNewSkill("");
                  }
                }}
              >
                Add
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Preview Section */}
      <div className="lg:w-1/2">
        <div className="sticky top-6 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-700">
              <Eye size={20} /> Real-time Preview
            </h2>
            <Button onClick={downloadPDF} className="bg-emerald-600 hover:bg-emerald-700 shadow-lg gap-2">
              <Download size={18} /> Export PDF
            </Button>
          </div>

          <div className="bg-white shadow-2xl rounded-lg overflow-hidden border">
            {/* The actual resume layout meant for PDF */}
            <div ref={resumeRef} className="p-12 w-full min-h-[842px] bg-white font-serif text-slate-900">
              <div className="text-center mb-8">
                <h1 className="text-4xl font-bold uppercase tracking-tighter mb-2">{profile.name}</h1>
                <p className="text-sm text-slate-600 space-x-2">
                  <span>{profile.email}</span>
                  <span>|</span>
                  <span>{profile.phone}</span>
                </p>
              </div>

              <div className="mb-6">
                <h2 className="text-sm font-bold uppercase tracking-widest text-blue-600 border-b-2 border-slate-100 pb-1 mb-3">Professional Summary</h2>
                <p className="text-sm leading-relaxed text-slate-700">{profile.summary}</p>
              </div>

              <div className="mb-6">
                <h2 className="text-sm font-bold uppercase tracking-widest text-blue-600 border-b-2 border-slate-100 pb-1 mb-3">Experience</h2>
                <div className="space-y-4">
                  {experience.map(exp => (
                    <div key={exp.id}>
                      <div className="flex justify-between items-baseline mb-1">
                        <h3 className="font-bold text-slate-900">{exp.company}</h3>
                        <span className="text-xs text-slate-500 font-sans italic">{exp.period}</span>
                      </div>
                      <p className="text-sm font-bold text-slate-700 mb-1">{exp.role}</p>
                      <p className="text-sm text-slate-600 leading-relaxed">• {exp.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="text-sm font-bold uppercase tracking-widest text-blue-600 border-b-2 border-slate-100 pb-1 mb-3">Technical Skills</h2>
                <p className="text-sm text-slate-700 font-sans leading-relaxed">
                  <span className="font-bold">Languages & Tools:</span> {skills.join(", ")}
                </p>
              </div>

              {/* ATS Optimization Badge - Preview Only */}
              <div className="mt-12 pt-8 border-t border-dashed border-slate-200 opacity-50 flex items-center justify-center gap-2 print:hidden">
                <CheckCircle2 size={16} className="text-emerald-500" />
                <span className="text-xs font-sans font-medium text-slate-500 uppercase tracking-widest">ATS Optimized Structure</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
