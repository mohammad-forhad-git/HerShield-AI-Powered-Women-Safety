"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardBody, CardHeader } from "@/components/ui/card";

export interface ChartStats {
  byCategory: { slug: string; name: string; color: string; count: number }[];
  byPriority: { priority: string; name: string; color: string; count: number }[];
  daily: { date: string; label: string; count: number }[];
  monthly: { month: string; total: number; resolved: number; critical: number }[];
  resolvedVsPending: { name: string; value: number; color: string }[];
}

const axis = { fontSize: 12, fill: "#64748B" };
const grid = "#E2E8F0";
const tooltipStyle = {
  borderRadius: 12,
  border: "1px solid #E2E8F0",
  boxShadow: "0 8px 24px -12px rgba(16,24,40,.25)",
  fontSize: 12,
};

function NoData() {
  return <div className="flex h-full items-center justify-center text-sm text-slate-400">No incident data yet</div>;
}

export function CategoryChart({ data }: { data: ChartStats["byCategory"] }) {
  const has = data.some((d) => d.count > 0);
  return (
    <div className="h-72">
      {has ? (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16, top: 4, bottom: 4 }}>
            <CartesianGrid horizontal={false} stroke={grid} />
            <XAxis type="number" allowDecimals={false} tick={axis} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="name" width={128} tick={axis} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "#F1F5F9" }} />
            <Bar dataKey="count" name="Incidents" radius={[0, 6, 6, 0]} barSize={16}>
              {data.map((d) => (
                <Cell key={d.slug} fill={d.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <NoData />
      )}
    </div>
  );
}

export function DonutChart({ data, label }: { data: { name: string; value: number; color: string }[]; label: string }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <div className="relative h-72">
      {total ? (
        <>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} dataKey="value" nameKey="name" innerRadius="58%" outerRadius="82%" paddingAngle={2} stroke="none">
                {data.map((d) => (
                  <Cell key={d.name} fill={d.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-x-0 top-[38%] text-center">
            <p className="text-2xl font-bold text-navy">{total}</p>
            <p className="text-xs text-slate-500">{label}</p>
          </div>
        </>
      ) : (
        <NoData />
      )}
    </div>
  );
}

export function DailyChart({ data }: { data: ChartStats["daily"] }) {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ left: -16, right: 8, top: 8 }}>
          <defs>
            <linearGradient id="dailyFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563EB" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#2563EB" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke={grid} />
          <XAxis dataKey="label" tick={axis} axisLine={false} tickLine={false} interval="preserveStartEnd" />
          <YAxis allowDecimals={false} tick={axis} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={tooltipStyle} />
          <Area type="monotone" dataKey="count" name="Incidents" stroke="#2563EB" strokeWidth={2} fill="url(#dailyFill)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function MonthlyChart({ data }: { data: ChartStats["monthly"] }) {
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ left: -16, right: 8, top: 8 }}>
          <CartesianGrid vertical={false} stroke={grid} />
          <XAxis dataKey="month" tick={axis} axisLine={false} tickLine={false} />
          <YAxis allowDecimals={false} tick={axis} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "#F1F5F9" }} />
          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="total" name="Reported" fill="#2563EB" radius={[6, 6, 0, 0]} barSize={18} />
          <Bar dataKey="resolved" name="Resolved" fill="#16A34A" radius={[6, 6, 0, 0]} barSize={18} />
          <Bar dataKey="critical" name="Critical" fill="#DC2626" radius={[6, 6, 0, 0]} barSize={18} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Complete analytics grid used by the admin overview & analytics pages. */
export function AnalyticsGrid({ stats, compact = false }: { stats: ChartStats; compact?: boolean }) {
  const priority = stats.byPriority.map((p) => ({ name: p.name, value: p.count, color: p.color }));
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader title="Incidents by category" description="Distribution across emergency types" />
        <CardBody><CategoryChart data={stats.byCategory} /></CardBody>
      </Card>
      <Card>
        <CardHeader title="Resolved vs pending" description="Current workload by state" />
        <CardBody><DonutChart data={stats.resolvedVsPending} label="incidents" /></CardBody>
      </Card>
      {!compact && (
        <>
          <Card>
            <CardHeader title="Daily incidents" description="Last 14 days" />
            <CardBody><DailyChart data={stats.daily} /></CardBody>
          </Card>
          <Card>
            <CardHeader title="Monthly trend" description="Last 6 months" />
            <CardBody><MonthlyChart data={stats.monthly} /></CardBody>
          </Card>
          <Card className="lg:col-span-2">
            <CardHeader title="Priority distribution" description="All incidents by assigned priority" />
            <CardBody><DonutChart data={priority} label="classified" /></CardBody>
          </Card>
        </>
      )}
    </div>
  );
}
