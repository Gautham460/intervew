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
  });

  const { isValid, isSubmitting } = form.formState;
  const [loading, setLoading] = useState(false);
  const [resumeSkills, setResumeSkills] = useState<SkillMatch[]>([]);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [preferredCompany, setPreferredCompany] = useState("");
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

  const cleanAiResponse = (responseText: string) => {
    // Step 1: Trim any surrounding whitespace
    let cleanText = responseText.trim();

    // Step 2: Remove any occurrences of "json" or code block symbols (``` or `)
    cleanText = cleanText.replace(/(json|```|`)/g, "");

    // Step 3: Extract a JSON array by capturing text between square brackets
    const jsonArrayMatch = cleanText.match(/\[.*\]/s);
    if (jsonArrayMatch) {
      cleanText = jsonArrayMatch[0];
    } else {
      throw new Error("No JSON array found in response");
    }

    // Step 4: Parse the clean JSON text into an array of objects
    try {
      return JSON.parse(cleanText);
    } catch (error) {
      throw new Error("Invalid JSON format: " + (error as Error)?.message);
    }
  };

  const generateAiResponse = async (data: FormData) => {
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
    const timeoutId = setTimeout(() => controller.abort(), 20000); // Increased timeout to 20 seconds

    try {
      console.log("Sending prompt to AI:", prompt); // Log the prompt being sent
      const aiResult = await chatSession.sendMessage(prompt, { signal: controller.signal });
      
      // Log the response from the AI
      console.log("AI Response:", aiResult);

      const cleanedResponse = cleanAiResponse(aiResult.response.text());
      return cleanedResponse;
    } catch (error) {
      console.error("Error generating AI response:", error); // Log the full error object
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error("Request timed out. Please try again.");
      }
      throw new Error(`Failed to generate AI response: ${error instanceof Error ? error.message : "Unknown error"}. Please try again.`);
    } finally {
      clearTimeout(timeoutId); // Clear the timeout
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);

      const aiResult = await generateAiResponse(data);
      
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

      if (initialData) {
        // update
        if (isValid) {
          await updateDoc(doc(db, "interviews", initialData?.id), {
            questions: aiResult,
            ...(skillQuestions.length > 0 && { skillQuestions }),
            ...data,
            difficulty,
            ...(preferredCompany && { preferredCompany }),
            updatedAt: serverTimestamp(),
          }).catch((error) => console.log(error));
          toast(toastMessage.title, { description: toastMessage.description });
        }
      } else {
        // create a new mock interview
        if (isValid) {
          await addDoc(collection(db, "interviews"), {
            ...data,
            userId,
            questions: aiResult,
            ...(skillQuestions.length > 0 && { skillQuestions }),
            difficulty,
            ...(preferredCompany && { preferredCompany }),
            createdAt: serverTimestamp(),
          });

          toast(toastMessage.title, { description: toastMessage.description });
        }
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
              onCompanyChange={(company) => setPreferredCompany(company)}
              onFunctionalitySelect={(func) => {
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
