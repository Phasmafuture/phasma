import PhasmaLogo from "@/components/brand/PhasmaLogo";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "@tanstack/react-router";
import { Activity, Brain, LineChart, Zap } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-8 sm:py-12">
        {/* Hero Section with mobile-friendly spacing */}
        <div className="flex flex-col items-center justify-center text-center mb-12 sm:mb-16 space-y-4 sm:space-y-6">
          <PhasmaLogo size="large" />
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight">
            PHASMA
          </h1>
          <p className="text-lg sm:text-xl text-gray-400 max-w-2xl px-4">
            Decentralized platform for surgical robotics reinforcement learning
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm text-gray-300">
              Simulation Demo Environment
            </span>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
          <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors">
            <CardHeader>
              <Brain className="w-8 h-8 text-white mb-2" />
              <CardTitle className="text-white">RL Training</CardTitle>
              <CardDescription className="text-gray-400">
                Simulated reinforcement learning training runs
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors">
            <CardHeader>
              <LineChart className="w-8 h-8 text-white mb-2" />
              <CardTitle className="text-white">Visualizations</CardTitle>
              <CardDescription className="text-gray-400">
                Real-time metrics playback and analysis
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors">
            <CardHeader>
              <Activity className="w-8 h-8 text-white mb-2" />
              <CardTitle className="text-white">Advanced Analytics</CardTitle>
              <CardDescription className="text-gray-400">
                Pro workspace with detailed insights
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors">
            <CardHeader>
              <Zap className="w-8 h-8 text-white mb-2" />
              <CardTitle className="text-white">Decentralized</CardTitle>
              <CardDescription className="text-gray-400">
                Built on Internet Computer
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* CTA Section */}
        <Card className="bg-gradient-to-br from-white/10 to-white/5 border-white/20">
          <CardContent className="p-6 sm:p-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
                  Start Training Simulation
                </h2>
                <p className="text-sm sm:text-base text-gray-400">
                  Create and visualize demo training runs with real-time metrics
                  playback
                </p>
              </div>
              <Link to="/runs">
                <Button
                  size="lg"
                  className="bg-white text-black hover:bg-gray-200 w-full sm:w-auto"
                >
                  View Training Runs
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Info Banner */}
        <div className="mt-8 sm:mt-12 p-4 sm:p-6 bg-white/5 border border-white/10 rounded-lg">
          <p className="text-xs sm:text-sm text-gray-400 text-center">
            <span className="font-semibold text-white">Note:</span> This is a
            simulation/demo environment. No actual RL compute or model training
            is performed. All metrics are precomputed for visualization
            purposes.
          </p>
        </div>
      </div>
    </div>
  );
}
