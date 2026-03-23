import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flame, Award, Trophy, Star } from "lucide-react";
import { motion } from "framer-motion";

interface GamificationBannerProps {
  streak: number;
  badges: string[];
}

export const GamificationBanner = ({ streak, badges }: GamificationBannerProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-gradient-to-r from-orange-500 to-red-600 text-white overflow-hidden shadow-lg border-none hover:shadow-orange-200/50 transition-shadow">
        <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-full">
              <Flame size={32} className="text-orange-100 fill-orange-500 animate-pulse" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">You're on fire!</h2>
              <p className="text-orange-100 opacity-90">{streak} Day Practice Streak</p>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            {badges.map((badge, idx) => (
              <motion.div
                key={badge}
                whileHover={{ scale: 1.05 }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * idx }}
              >
                <Badge className="bg-white/10 hover:bg-white/20 text-white border-white/20 py-1.5 px-3 flex items-center gap-2">
                  {idx === 0 && <Award size={14} className="text-yellow-300" />}
                  {idx === 1 && <Trophy size={14} className="text-amber-300" />}
                  {idx === 2 && <Star size={14} className="text-blue-300" />}
                  {badge}
                </Badge>
              </motion.div>
            ))}
          </div>

          <div className="text-right hidden md:block">
            <p className="text-xs uppercase tracking-widest text-orange-200 font-bold">Next Milestone</p>
            <p className="text-lg font-bold">5 Day Streak</p>
            <div className="w-32 h-1.5 bg-white/20 rounded-full mt-1 overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${(streak / 5) * 100}%` }}
                className="h-full bg-white" 
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
