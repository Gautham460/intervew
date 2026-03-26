import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";

import { Interview } from "@/types";

import { CustomBreadCrumb } from "./custom-bread-crumb";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { toast } from "sonner";
import { Headings } from "./headings";
import { Button } from "./ui/button";
import { Loader, Trash2 } from "lucide-react";
import { Separator } from "./ui/separator";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { chatSession } from "@/scripts";
import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/config/firebase.config";
import { ResumeUpload } from "./resume-upload";
import { SkillMatch } from "@/lib/resume-parser";
import { fetchQuestionsForSkills } from "@/lib/skill-questions-db";
import { getCompanyQuestions } from "@/lib/company-questions";
import { cleanAiResponse } from "@/lib/helpers";

interface FormMockInterviewProps {
  initialData: Interview | null;
}

const formSchema = z.object({
  position: z
    .string()
    .min(1, "Position is required")
    .max(100, "Position must be 100 characters or less"),
  description: z.string().min(10, "Description is required"),
  experience: z.coerce
    .number()
    .min(0, "Experience cannot be empty or negative"),
  techStack: z.string().min(1, "Tech stack must be at least a character"),
  preferredCompany: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export const FormMockInterview = ({ initialData }: FormMockInterviewProps) => {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {},
    mode: "onChange",
  });

  const { isValid, isSubmitting } = form.formState;
  const [loading, setLoading] = useState(false);
  const [resumeSkills, setResumeSkills] = useState<SkillMatch[]>([]);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [preferredCompany, setPreferredCompany] = useState("");
  const [functionality, setFunctionality] = useState<string | null>(null);
  const navigate = useNavigate();
  const { userId } = useAuth();

  const title = initialData
    ? initialData.position
    : "Create a new mock interview";

  const breadCrumpPage = initialData ? initialData?.position : "Create";
  const actions = initialData ? "Save Changes" : "Create";
  const toastMessage = initialData
    ? { title: "Updated..!", description: "Changes saved successfully..." }
    : { title: "Created..!", description: "New Mock Interview created..." };


  const generateAiResponse = async (data: FormData, retries = 2, delayMs = 3000): Promise<any[]> => {
    const prompt = `
        As an experienced prompt engineer, generate a JSON array containing 5 technical interview questions along with detailed answers based on the following job information. Each object in the array should have the fields "question" and "answer", formatted as follows:

        [
          { "question": "<Question text>", "answer": "<Answer text>" },
          ...
        ]

        Job Information:
        - Job Position: ${data?.position}
        - Job Description: ${data?.description}
        - Years of Experience Required: ${data?.experience}
        - Tech Stacks: ${data?.techStack}
        ${data?.preferredCompany ? `- Target Company: ${data?.preferredCompany}` : ""}

        The questions should be highly specific to the Job Description provided. If a specific company is mentioned, include questions related to their known interview patterns or technical standards. Assess skills in ${data?.techStack} development and best practices, problem-solving, and experience handling complex requirements.
        Return only the JSON array with questions and answers.
        `;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000); // 20 seconds timeout

    try {
      console.log("Sending prompt to AI:", prompt);
      const aiResult = await chatSession.sendMessage(prompt, { signal: controller.signal });
      
      const cleanedResponse = cleanAiResponse(aiResult.response.text());
      return cleanedResponse;
    } catch (error: any) {
      console.error("Error generating AI response:", error);
      
      // Auto-retry specifically for 429 Quota Exceeded Errors
      if (retries > 0 && error?.message?.includes('429')) {
        console.warn(`Hit Gemini rate limit. Retrying in ${delayMs}ms. Retries left: ${retries}`);
        await new Promise((res) => setTimeout(res, delayMs));
        return generateAiResponse(data, retries - 1, delayMs * 2);
      }
      
      // Fallback questions to prevent complete application blockage
      console.warn("AI Generation failed completely. Injecting generic mock fallback questions.");
      toast.info("API Quota Reached: Generating standard technical questions.");
      return [
        { question: `Can you walk me through your experience as a ${data.position || "professional"}?`, answer: "The candidate should clearly structure their background, focusing on relevant timeline details." },
        { question: `Describe a time you used ${data.techStack || "these technologies"} to solve a complex problem.`, answer: "Look for a STAR method response detailing a specific technical challenge and actionable resolution." },
        { question: "How do you handle disagreements on system architecture or code structure with your team?", answer: "Focus on communication, adaptability, and data-driven logical decision making." },
        { question: "What is your approach to testing and ensuring code quality before deploying?", answer: "They should mention unit tests, edge case considerations, CI/CD integrations, and code reviews." },
        { question: `Why do you feel you are the perfect fit for this specific role?`, answer: "Candidate should align their past experience practically against the job's daily requirements." }
      ];
    } finally {
      clearTimeout(timeoutId);
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);

      let aiResult: any[] = [];
      
      // If user selected Company DB functionality and provided a company
      if (functionality === "company-questions" && data.preferredCompany) {
        toast.info("Fetching from Company Database...");
        try {
          const companyDbQs = await getCompanyQuestions(data.preferredCompany, data.position);
          let matchQs = companyDbQs;
          
          if (matchQs.length === 0) {
            // fallback to any questions for that company if role doesn't match
            matchQs = await getCompanyQuestions(data.preferredCompany);
          }

          if (matchQs.length > 0) {
            aiResult = matchQs.slice(0, 5).map(q => ({
              question: q.question,
              answer: q.exampleAnswer || "Please provide a structured answer highlighting your experience."
            }));
            toast.success("Loaded questions exclusively from Enterprise DB!");
          } else {
            toast.warning(`No questions found in DB for ${data.preferredCompany}. Falling back to AI...`);
            aiResult = await generateAiResponse(data);
          }
        } catch (e) {
          console.error("DB fetch failed, using AI fallback", e);
          aiResult = await generateAiResponse(data);
        }
      } else {
        // Standard AI Mock Interview functionality
        aiResult = await generateAiResponse(data);
      }
      
      // Fetch skill-based questions from database if resume skills were extracted
      let skillQuestions: any[] = [];
      if (resumeSkills.length > 0) {
        try {
          const skillNames = resumeSkills.map((s) => s.skill);
          skillQuestions = await fetchQuestionsForSkills(skillNames);
          
          if (skillQuestions.length === 0) {
            console.warn(
              "No questions found in database for extracted skills. Make sure to seed the database."
            );
            toast.warning("No skill questions available", {
              description:
                "Skills were extracted but no questions found in database. Contact support.",
            });
          } else {
            toast.success("Skill questions loaded", {
              description: `Found ${skillQuestions.length} skill-based questions`,
            });
          }
        } catch (error) {
          console.error("Error fetching skill-based questions:", error);
          toast.warning("Could not load skill questions", {
            description: "Continuing with general questions only",
          });
        }
      }

      const finalPreferredCompany = data.preferredCompany || preferredCompany;

      if (initialData) {
        // update
        await updateDoc(doc(db, "interviews", initialData?.id), {
          position: data.position,
          description: data.description,
          experience: data.experience,
          techStack: data.techStack,
          questions: aiResult,
          ...(skillQuestions.length > 0 && { skillQuestions }),
          difficulty,
          ...(finalPreferredCompany && { preferredCompany: finalPreferredCompany }),
          updatedAt: serverTimestamp(),
        }).catch((error) => console.log(error));
        toast(toastMessage.title, { description: toastMessage.description });
      } else {
        // create a new mock interview
        await addDoc(collection(db, "interviews"), {
          position: data.position,
          description: data.description,
          experience: data.experience,
          techStack: data.techStack,
          userId,
          questions: aiResult,
          ...(skillQuestions.length > 0 && { skillQuestions }),
          difficulty,
          ...(finalPreferredCompany && { preferredCompany: finalPreferredCompany }),
          createdAt: serverTimestamp(),
        });

        toast(toastMessage.title, { description: toastMessage.description });
      }

      navigate("/generate", { replace: true });
    } catch (error) {
      console.log(error);
      toast.error("Error..", {
        description: error instanceof Error ? error.message : "Something went wrong. Please try again later",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialData) {
      form.reset({
        position: initialData.position,
        description: initialData.description,
        experience: initialData.experience,
        techStack: initialData.techStack,
      });
    }
  }, [initialData, form]);

  return (
    <div className="w-full flex-col space-y-4">
      <CustomBreadCrumb
        breadCrumbPage={breadCrumpPage}
        breadCrumpItems={[{ label: "Mock Interviews", link: "/generate" }]}
      />

      <div className="mt-4 flex items-center justify-between w-full">
        <Headings title={title} isSubHeading />

        {initialData && (
          <Button size={"icon"} variant={"ghost"}>
            <Trash2 className="min-w-4 min-h-4 text-red-500" />
          </Button>
        )}
      </div>

      <Separator className="my-4" />

      <div className="my-6"></div>

      <FormProvider {...form}>
        <form
          aria-label="Interview Form"
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full p-8 rounded-lg flex-col flex items-start justify-start gap-6 shadow-md "
        >
          {/* Resume Upload Section */}
          <div className="w-full space-y-4 pb-6 border-b">
            <div>
              <FormLabel className="text-base font-semibold">
                Resume Upload (Optional)
              </FormLabel>
              <p className="text-sm text-gray-600 mt-1">
                Upload your resume to automatically extract skills and generate skill-based questions
              </p>
            </div>
            <ResumeUpload
              onSkillsExtracted={(skills) => {
                setResumeSkills(skills);
                if (skills.length > 0) {
                  // Auto-fill tech stack from resume
                  const skillNames = skills.map((s) => s.skill).join(", ");
                  form.setValue("techStack", skillNames);
                }
              }}
              onDifficultyChange={(diff) => setDifficulty(diff)}
              onCompanyChange={(company) => {
                setPreferredCompany(company);
                form.setValue("preferredCompany", company);
              }}
              onFunctionalitySelect={(func) => {
                setFunctionality(func);
                console.log("Functionality selected:", func);
              }}
            />
          </div>
          <FormField
            control={form.control}
            name="position"
            render={({ field }) => (
              <FormItem className="w-full space-y-4">
                <div className="w-full flex items-center justify-between">
                  <FormLabel>Job Role / Job Position</FormLabel>
                  <FormMessage className="text-sm" />
                </div>
                <FormControl>
                  <Input
                    className="h-12"
                    disabled={loading}
                    placeholder="eg:- Full Stack Developer"
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="w-full space-y-4">
                <div className="w-full flex items-center justify-between">
                  <FormLabel>Job Description</FormLabel>
                  <FormMessage className="text-sm" />
                </div>
                <FormControl>
                  <Textarea
                    className="h-12"
                    disabled={loading}
                    placeholder="eg:- describle your job role"
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="experience"
            render={({ field }) => (
              <FormItem className="w-full space-y-4">
                <div className="w-full flex items-center justify-between">
                  <FormLabel>Years of Experience</FormLabel>
                  <FormMessage className="text-sm" />
                </div>
                <FormControl>
                  <Input
                    type="number"
                    className="h-12"
                    disabled={loading}
                    placeholder="eg:- 5 Years"
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="techStack"
            render={({ field }) => (
              <FormItem className="w-full space-y-4">
                <div className="w-full flex items-center justify-between">
                  <FormLabel>Tech Stacks</FormLabel>
                  <FormMessage className="text-sm" />
                </div>
                <FormControl>
                  <Textarea
                    className="h-12"
                    disabled={loading}
                    placeholder="eg:- React, Typescript..."
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="preferredCompany"
            render={({ field }) => (
              <FormItem className="w-full space-y-4">
                <div className="w-full flex items-center justify-between">
                  <FormLabel>Target Company (Optional)</FormLabel>
                  <FormMessage className="text-sm" />
                </div>
                <FormControl>
                  <Input
                    className="h-12"
                    disabled={loading}
                    placeholder="eg:- Google, Amazon, Meta..."
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <div className="w-full flex items-center justify-end gap-6">
            <Button
              type="reset"
              size={"sm"}
              variant={"outline"}
              disabled={isSubmitting || loading}
            >
              Reset
            </Button>
            <Button
              type="submit"
              size={"sm"}
              disabled={isSubmitting || !isValid || loading}
            >
              {loading ? (
                <Loader className="text-gray-50 animate-spin" />
              ) : (
                actions
              )}
            </Button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
};
