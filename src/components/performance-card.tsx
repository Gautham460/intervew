import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SkillPerformance } from "@/lib/analytics";
import { Badge } from "./ui/badge";
import { TrendingDown, TrendingUp, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface PerformanceCardProps {
  skill: SkillPerformance;
  variant?: "compact" | "detailed";
}

export const PerformanceCard = ({ skill, variant = "compact" }: PerformanceCardProps) => {
  const getRatingColor = (rating: number) => {
    if (rating >= 8) return "text-emerald-500";
    if (rating >= 6) return "text-blue-500";
    if (rating >= 4) return "text-yellow-500";
    return "text-red-500";
  };

  const getRatingBgColor = (rating: number) => {
    if (rating >= 8) return "bg-emerald-50";
    if (rating >= 6) return "bg-blue-50";
    if (rating >= 4) return "bg-yellow-50";
    return "bg-red-50";
  };

  const getTrendIcon = (rate: number) => {
    if (rate > 5) return <TrendingUp className="w-4 h-4 text-emerald-500" />;
    if (rate < -5) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  if (variant === "compact") {
    return (
      <div className="flex items-center justify-between p-3 border rounded-lg hover:shadow-sm transition-shadow">
        <div className="flex-1">
          <p className="font-semibold text-sm">{skill.skill}</p>
          <p className="text-xs text-muted-foreground">{skill.questionCount} questions</p>
        </div>
        <div className={cn("px-3 py-1 rounded text-sm font-bold", getRatingColor(skill.averageRating))}>
          {skill.averageRating.toFixed(1)}/10
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{skill.skill}</CardTitle>
          <Badge variant={skill.averageRating >= 7 ? "default" : "secondary"}>
            {skill.averageRating >= 8
              ? "Excellent"
              : skill.averageRating >= 6
              ? "Good"
              : skill.averageRating >= 4
              ? "Fair"
              : "Poor"}
          </Badge>
        </div>
        <CardDescription className="text-xs">
          Last attempted {new Date(skill.lastAttemptDate).toLocaleDateString()}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className={cn("p-4 rounded-lg text-center", getRatingBgColor(skill.averageRating))}>
          <p className={cn("text-3xl font-bold", getRatingColor(skill.averageRating))}>
            {skill.averageRating.toFixed(1)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Average Rating</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-2 bg-gray-50 rounded text-center">
            <p className="text-2xl font-bold text-gray-700">{skill.questionCount}</p>
            <p className="text-xs text-muted-foreground">Questions</p>
          </div>
          <div className="p-2 bg-gray-50 rounded text-center flex flex-col items-center justify-center">
            {getTrendIcon(skill.improvementRate)}
            <p className="text-xs text-muted-foreground mt-1">{Math.abs(skill.improvementRate)}%</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
