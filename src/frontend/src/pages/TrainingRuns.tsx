import CreateDemoRunDialog from "@/components/runs/CreateDemoRunDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { recordActivity } from "@/lib/analytics/localActivityStore";
import { useDemoRuns } from "@/lib/demoRuns";
import { Link, useNavigate } from "@tanstack/react-router";
import { Clock, PlayCircle, Plus, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";

export default function TrainingRuns() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { runs, createRun } = useDemoRuns();
  const navigate = useNavigate();

  // Record page view
  useEffect(() => {
    recordActivity("page_view", { page: "training_runs" });
  }, []);

  const handleCreateRun = (
    name: string,
    description: string,
    modelType: "surgical" | "humanoid" = "surgical",
  ) => {
    createRun(name, description, modelType);
    recordActivity("run_created", { name, description, modelType });
    setIsCreateDialogOpen(false);
  };

  const handleViewRun = (runId: string) => {
    recordActivity("run_viewed", { runId });
    navigate({ to: "/runs/$runId", params: { runId } });
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Training Runs
            </h1>
            <p className="text-gray-400">
              Manage and visualize simulated RL training runs
            </p>
          </div>
          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            className="bg-white text-black hover:bg-gray-200"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Demo Run
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/5 border-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-400">
                Total Runs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{runs.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-400">
                Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {runs.filter((r) => r.status === "completed").length}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-400">
                Running
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {runs.filter((r) => r.status === "running").length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Runs Table */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">All Training Runs</CardTitle>
            <CardDescription className="text-gray-400">
              Surgical and humanoid simulated training runs with precomputed
              metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            {runs.length === 0 ? (
              <div className="text-center py-12">
                <PlayCircle className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 mb-4">No training runs yet</p>
                <Button
                  onClick={() => setIsCreateDialogOpen(true)}
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  Create Your First Run
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10 hover:bg-transparent">
                    <TableHead className="text-gray-400">Name</TableHead>
                    <TableHead className="text-gray-400">Model</TableHead>
                    <TableHead className="text-gray-400">Status</TableHead>
                    <TableHead className="text-gray-400">Episodes</TableHead>
                    <TableHead className="text-gray-400">Created</TableHead>
                    <TableHead className="text-gray-400">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {runs.map((run) => (
                    <TableRow
                      key={run.id}
                      className="border-white/10 hover:bg-white/5"
                    >
                      <TableCell>
                        <div>
                          <div className="font-medium text-white">
                            {run.name}
                          </div>
                          {run.description && (
                            <div className="text-sm text-gray-400">
                              {run.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs px-2 py-0.5 rounded border border-white/15 text-gray-300 bg-white/5 capitalize">
                          {run.modelType ?? "surgical"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            run.status === "completed" ? "default" : "outline"
                          }
                          className={
                            run.status === "completed"
                              ? "bg-white/20 text-white border-white/30"
                              : "border-white/30 text-gray-300"
                          }
                        >
                          {run.status === "completed" ? (
                            <>
                              <TrendingUp className="w-3 h-3 mr-1" />
                              Completed
                            </>
                          ) : (
                            <>
                              <Clock className="w-3 h-3 mr-1" />
                              Running
                            </>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-300">
                        {run.totalEpisodes}
                      </TableCell>
                      <TableCell className="text-gray-300">
                        {new Date(run.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          onClick={() => handleViewRun(run.id)}
                          variant="outline"
                          size="sm"
                          className="border-white/20 text-white hover:bg-white/10"
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <CreateDemoRunDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onCreateRun={handleCreateRun}
      />
    </div>
  );
}
