"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { StatCard } from "@/components/statcard";
import { StatusBadge } from "@/components/status.badge";
import {
  getDashboardStats,
  getEvents,
  createEvent,
  type Event,
} from "@/lib/api";

export default function DashboardPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);

  const statsQuery = useQuery({
    queryKey: ["stats"],
    queryFn: getDashboardStats,
  });

  const eventsQuery = useQuery({
    queryKey: ["events", page],
    queryFn: () => getEvents(page),
  });

  const [eventType, setEventType] = useState("");
  const [eventData, setEventData] = useState("{\n  \n}");
  const [formError, setFormError] = useState("");

  const createMutation = useMutation({
    mutationFn: ({
      type,
      data,
    }: {
      type: string;
      data: Record<string, unknown>;
    }) => createEvent(type, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["stats"] });
      qc.invalidateQueries({ queryKey: ["events"] });
      setEventType("");
      setEventData("{\n  \n}");
      setFormError("");
    },
    onError: (err: Error) => setFormError(err.message),
  });

  function handleCreateEvent(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(eventData);
    } catch {
      setFormError("Event data must be valid JSON");
      return;
    }
    createMutation.mutate({ type: eventType, data: parsed });
  }

  const stats = statsQuery.data;
  const eventsData = eventsQuery.data;

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
      <section>
        <h2 className="mb-3 text-sm font-semibold tracking-wide text-slate-500 uppercase">
          Fire Event
        </h2>
        <form
          onSubmit={handleCreateEvent}
          className="space-y-3 rounded-xl border border-slate-200 bg-white p-5"
        >
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">
              Event Type
            </label>
            <input
              required
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              placeholder="e.g. user.created"
              className="rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm outline-none focus:border-slate-500"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">
              Payload (JSON)
            </label>
            <textarea
              required
              value={eventData}
              onChange={(e) => setEventData(e.target.value)}
              rows={4}
              className="rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm outline-none focus:border-slate-500"
            />
          </div>
          {formError && <p className="text-sm text-red-600">{formError}</p>}
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
          >
            {createMutation.isPending ? "Sending…" : "Fire Event"}
          </button>
        </form>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold tracking-wide text-slate-500 uppercase">
          Overview
        </h2>
        {statsQuery.isLoading ? (
          <p className="text-slate-400">Loading…</p>
        ) : statsQuery.isError ? (
          <p className="text-red-500">{(statsQuery.error as Error).message}</p>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            <StatCard label="Total Events" value={stats?.total ?? 0} />
            <StatCard
              label="Delivered"
              value={stats?.success ?? 0}
              accent="emerald"
            />
            <StatCard label="Failed" value={stats?.failed ?? 0} accent="red" />
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold tracking-wide text-slate-500 uppercase">
          Recent Events
        </h2>
        {eventsQuery.isLoading ? (
          <p className="text-slate-400">Loading…</p>
        ) : eventsQuery.isError ? (
          <p className="text-red-500">{(eventsQuery.error as Error).message}</p>
        ) : !eventsData?.data.length ? (
          <p className="text-slate-400">No events yet.</p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-100 bg-slate-50 text-left">
                <tr>
                  <th className="px-4 py-3 font-semibold text-slate-600">ID</th>
                  <th className="px-4 py-3 font-semibold text-slate-600">
                    Type
                  </th>
                  <th className="px-4 py-3 font-semibold text-slate-600">
                    Status
                  </th>
                  <th className="px-4 py-3 font-semibold text-slate-600">
                    Created
                  </th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {eventsData.data.map((ev: Event) => (
                  <tr key={ev.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-500">#{ev.id}</td>
                    <td className="px-4 py-3 font-mono text-slate-800">
                      {ev.type}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={ev.status} />
                    </td>
                    <td className="px-4 py-3 text-slate-400">
                      {new Date(ev.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/events/${ev.id}`}
                        className="text-slate-500 hover:text-slate-800 hover:underline"
                      >
                        View →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {eventsData.pagination.totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
                <p className="text-xs text-slate-400">
                  Page {eventsData.pagination.page} of{" "}
                  {eventsData.pagination.totalPages}
                </p>
                <div className="flex gap-2">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="rounded border border-slate-200 px-3 py-1 text-xs hover:bg-slate-50 disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <button
                    disabled={page >= eventsData.pagination.totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="rounded border border-slate-200 px-3 py-1 text-xs hover:bg-slate-50 disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
