"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  TrendingUp,
  Calendar,
  Clock,
  FileText,
  Mic2,
  Activity,
  ArrowUpRight,
  Zap,
  ChevronRight,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { UsageData } from "@/lib/services/usageService";

interface UsageClientProps {
  initialData: UsageData;
}

// Format numbers helper (defined outside component to avoid recreation)
function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

// Custom tooltip for charts (defined outside component)
interface CustomTooltipProps {
  active?: boolean;
  payload?: ReadonlyArray<{ value: number }>;
  label?: string | number;
  chartType: "characters" | "generations";
}

function CustomTooltip({ active, payload, label, chartType }: CustomTooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover border rounded-lg shadow-lg p-3">
        <p className="font-medium text-sm">{label}</p>
        <p className="text-sm text-muted-foreground">
          {chartType === "characters" ? "Characters: " : "Generations: "}
          <span className="font-medium text-foreground">
            {formatNumber(payload[0].value)}
          </span>
        </p>
      </div>
    );
  }
  return null;
}

/**
 * Usage Client Component
 *
 * Displays comprehensive usage analytics with charts and breakdowns.
 */
export function UsageClient({ initialData }: UsageClientProps) {
  const [data] = useState<UsageData>(initialData);
  const [chartType, setChartType] = useState<"characters" | "generations">("characters");

  const { summary, history, byVoice, recentActivity } = data;

  // Get status color based on percentage
  const getStatusColor = (percentage: number) => {
    if (percentage >= 90) return "text-red-500";
    if (percentage >= 70) return "text-yellow-500";
    return "text-green-500";
  };

  // Chart colors
  const chartColors = {
    characters: "hsl(var(--primary))",
    generations: "hsl(var(--chart-2))",
  };

  // Calculate total generations for percentages
  const totalGenerations = byVoice.reduce((sum, v) => sum + v.generations, 0);
  const maxGenerations = byVoice.length > 0 ? Math.max(...byVoice.map((v) => v.generations)) : 0;

  // Get color based on rank
  const getVoiceColor = (index: number) => {
    const colors = [
      "bg-primary",
      "bg-blue-500",
      "bg-violet-500",
      "bg-amber-500",
      "bg-emerald-500",
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="container mx-auto max-w-7xl py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Usage Analytics</h1>
            <p className="text-muted-foreground mt-1">
              Track your usage patterns and optimize your workflow
            </p>
          </div>
          <Link href="/billing">
            <Button variant="outline">
              <Zap className="h-4 w-4 mr-2" />
              {summary.plan === "free" ? "Upgrade Plan" : "Manage Plan"}
            </Button>
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Characters Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Characters Used
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">
                {formatNumber(summary.charactersUsed)}
              </span>
              <span className="text-muted-foreground">
                / {formatNumber(summary.charactersLimit)}
              </span>
            </div>
            <div className="mt-3">
              <div className="flex justify-between text-sm mb-1">
                <span className={getStatusColor(summary.charactersPercentage)}>
                  {summary.charactersPercentage}% used
                </span>
                <span className="text-muted-foreground">
                  {formatNumber(summary.charactersLimit - summary.charactersUsed)} left
                </span>
              </div>
              <Progress
                value={summary.charactersPercentage}
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>

        {/* Generations Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Mic2 className="h-4 w-4" />
              Generations Used
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">
                {summary.generationsUsed}
              </span>
              <span className="text-muted-foreground">
                / {summary.generationsLimit}
              </span>
            </div>
            <div className="mt-3">
              <div className="flex justify-between text-sm mb-1">
                <span className={getStatusColor(summary.generationsPercentage)}>
                  {summary.generationsPercentage}% used
                </span>
                <span className="text-muted-foreground">
                  {summary.generationsLimit - summary.generationsUsed} left
                </span>
              </div>
              <Progress
                value={summary.generationsPercentage}
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>

        {/* Daily Average Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Daily Average
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">
                {formatNumber(summary.averageDaily.characters)}
              </span>
              <span className="text-muted-foreground">chars/day</span>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {summary.averageDaily.generations} gen/day
              </Badge>
              <span className="text-xs text-muted-foreground">
                over {summary.daysElapsed} days
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Period Remaining Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Billing Period
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">{summary.daysRemaining}</span>
              <span className="text-muted-foreground">days left</span>
            </div>
            <div className="mt-2">
              <p className="text-xs text-muted-foreground">
                Resets on{" "}
                {new Date(summary.periodEnd).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Usage History Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Usage History
                </CardTitle>
                <CardDescription>Last 7 days activity</CardDescription>
              </div>
              <Tabs value={chartType} onValueChange={(v) => setChartType(v as "characters" | "generations")}>
                <TabsList className="grid grid-cols-2 w-[200px]">
                  <TabsTrigger value="characters">Characters</TabsTrigger>
                  <TabsTrigger value="generations">Generations</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={history} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={chartColors[chartType]} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={chartColors[chartType]} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    className="fill-muted-foreground"
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    className="fill-muted-foreground"
                    tickFormatter={(value) => formatNumber(value)}
                  />
                  <Tooltip content={(props) => <CustomTooltip {...props} chartType={chartType} />} />
                  <Area
                    type="monotone"
                    dataKey={chartType}
                    stroke={chartColors[chartType]}
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorUsage)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Voice Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mic2 className="h-5 w-5" />
              Voice Distribution
            </CardTitle>
            <CardDescription>
              {totalGenerations > 0
                ? `Usage by voice (${totalGenerations} total)`
                : "Usage by voice"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {byVoice.length === 0 ? (
              <div className="text-center py-8">
                <Mic2 className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No voice usage yet</p>
                <Link href="/tts">
                  <Button className="mt-4" size="sm">
                    Create First Generation
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-2 max-h-[280px] overflow-y-auto scrollbar-hide">
                {byVoice.map((voice, index) => {
                  const percentage = totalGenerations > 0
                    ? Math.round((voice.generations / totalGenerations) * 100)
                    : 0;
                  const barWidth = maxGenerations > 0
                    ? (voice.generations / maxGenerations) * 100
                    : 0;

                  return (
                    <div key={voice.voiceId} className="group">
                      <div className="flex items-center justify-between mb-0.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className={`h-2 w-2 rounded-full ${getVoiceColor(index)}`}
                          />
                          <span className="font-medium text-xs">
                            {voice.voiceName}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs">
                          <span className="font-semibold">
                            {voice.generations}
                          </span>
                          <span className="text-muted-foreground">
                            ({percentage}%)
                          </span>
                        </div>
                      </div>
                      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ease-out ${getVoiceColor(index)}`}
                          style={{ width: `${barWidth}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                        <span>{formatNumber(voice.characters)} chars</span>
                        <span>~{voice.averageLength}/gen</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section: Voice Breakdown & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Voice Breakdown Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Voice Breakdown
            </CardTitle>
            <CardDescription>Detailed usage per voice</CardDescription>
          </CardHeader>
          <CardContent>
            {byVoice.length === 0 ? (
              <div className="text-center py-8">
                <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No usage data yet</p>
                <Link href="/tts">
                  <Button className="mt-4">Create First Generation</Button>
                </Link>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Voice</TableHead>
                    <TableHead className="text-right">Generations</TableHead>
                    <TableHead className="text-right">Characters</TableHead>
                    <TableHead className="text-right">Avg Length</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {byVoice.map((voice) => (
                    <TableRow key={voice.voiceId}>
                      <TableCell className="font-medium">{voice.voiceName}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {voice.generations}
                          <Badge variant="secondary" className="text-xs">
                            {voice.percentage}%
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">{formatNumber(voice.characters)}</TableCell>
                      <TableCell className="text-right">{voice.averageLength}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
                <CardDescription>Your latest generations</CardDescription>
              </div>
              <Link href="/library">
                <Button variant="ghost" size="sm">
                  View All
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentActivity.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No recent activity</p>
                <Link href="/tts">
                  <Button className="mt-4">Get Started</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {recentActivity.slice(0, 5).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-shrink-0 mt-1">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Mic2 className="h-4 w-4 text-primary" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {item.text.length > 60 ? `${item.text.slice(0, 60)}...` : item.text}
                      </p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span>{item.voiceName}</span>
                        <span>{item.characters} chars</span>
                        <span>{item.duration}s</span>
                      </div>
                    </div>
                    <div className="flex-shrink-0 text-xs text-muted-foreground">
                      {item.timeAgo}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Usage Tips */}
      {summary.charactersPercentage >= 70 && (
        <Card className="mt-6 border-yellow-500/50 bg-yellow-500/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-yellow-600" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-medium">Approaching Usage Limit</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  You&apos;ve used {summary.charactersPercentage}% of your character limit.
                  {summary.plan === "free"
                    ? " Consider upgrading to Pro for 5x more characters and generations."
                    : " Your usage will reset on the next billing cycle."}
                </p>
                {summary.plan === "free" && (
                  <Link href="/billing">
                    <Button size="sm" className="mt-3">
                      <Zap className="h-4 w-4 mr-2" />
                      Upgrade to Pro
                      <ArrowUpRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
