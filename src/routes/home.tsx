import { Sparkles, TrendingUp, BarChart3, Zap, GitBranch } from "lucide-react";
import "./home.css";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@clerk/clerk-react";

const HomePage = () => {
  const { userId } = useAuth();

  const features = [
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: "AI-Powered Questions",
      description: "Get intelligent interview questions tailored to your skills and experience level",
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Resume Analysis",
      description: "Upload your resume and get skill-based questions from our database",
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Performance Analytics",
      description: "Track your progress with detailed analytics and performance insights",
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Real-time Feedback",
      description: "Get instant AI-generated feedback on your answers with improvement suggestions",
    },
    {
      icon: <GitBranch className="w-6 h-6" />,
      title: "Voice Recording",
      description: "Practice speaking confidently with built-in voice recording features",
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Skill Tracking",
      description: "Monitor your strength and weakness across different technical skills",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      {/* Main content */}
      <section className="hero flex-grow flex items-center justify-center">
        <div className="hero__column">
          <h1 className="h1 hero__heading">
            <span className="hero__heading-gradient">Intelligent</span>
            Interview Preparation Platform
          </h1>
          <p className="text-gray-300 text-lg mb-6">
            Practice mock interviews, get AI feedback, and track your progress with real-time analytics.
          </p>
          <Link to={userId ? "/generate" : "/select-role"} className="w-full">
            <Button className="w-3/4 text-lg py-6">
              {userId ? "Start Interview" : "Get Started"} <Sparkles className="ml-2" />
            </Button>
          </Link>
        </div>
        <div className="hero__column">
          <img
            className="hero__graphic w-[500px] h-[500px] "
            src="src/routes/abstract-shapes.png"
            alt="abstract shapes"
          />
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-16 bg-gray-900 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold mb-12 text-center">Powerful Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <div className="text-emerald-400 mb-3">{feature.icon}</div>
                  <CardTitle className="text-white">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-400">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Ace Your Interview?</h2>
          <p className="text-gray-400 text-lg mb-8">
            Join thousands of candidates preparing for their dream jobs with Intervue
          </p>
          <Link to={userId ? "/generate" : "/select-role"}>
            <Button size="lg" className="text-lg px-8 py-6">
              Start Free Today <Sparkles className="ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="w-full text-center py-4 bg-gray-900 text-gray-500 border-t border-gray-800">
        © {new Date().getFullYear()} Intervue. All Rights Reserved.
      </footer>
    </div>
  );
};

export default HomePage;
