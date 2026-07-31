"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getSubscriptions,
  createSubscription,
  type Subscription,
} from "@/lib/api";

export default function SubscriptionsPage() {
  const qc = useQueryClient();
  const [eventType, setEventType] = useState("");
  const [url, setUrl] = useState("");
  const [formError, setFormError] = useState("");

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["subscriptions"],
    queryFn: getSubscriptions,
  });

  const createMutation = useMutation({
    mutationFn: ({ eventType, url }: { eventType: string; url: string }) =>
      createSubscription(eventType, url),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["subscriptions"] });
      setEventType("");
      setUrl("");
      setFormError("");
    },
    onError: (err: Error) => setFormError(err.message),
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    createMutation.mutate({ eventType, url });
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <h1 className="text-2xl font-bold text-slate-800">Subscriptions</h1>

      {/* Create form */}
      <section>
        <h2 className="mb-3 text-sm font-semibold tracking-wide text-slate-500 uppercase">
          Add Subscription
        </h2>
        <form
          onSubmit={handleSubmit}
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
              Webhook URL
            </label>
            <input
              required
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://your-server.com/webhook"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
            />
          </div>
          {formError && <p className="text-sm text-red-600">{formError}</p>}
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
          >
            {createMutation.isPending ? "Saving…" : "Add Subscription"}
          </button>
        </form>
      </section>

      {/* List */}
      <section>
        <h2 className="mb-3 text-sm font-semibold tracking-wide text-slate-500 uppercase">
          Your Subscriptions
        </h2>
        {isLoading ? (
          <p className="text-slate-400">Loading…</p>
        ) : isError ? (
          <p className="text-red-500">{(error as Error).message}</p>
        ) : !data?.length ? (
          <p className="text-slate-400">No subscriptions yet.</p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-100 bg-slate-50 text-left">
                <tr>
                  <th className="px-4 py-3 font-semibold text-slate-600">
                    Event Type
                  </th>
                  <th className="px-4 py-3 font-semibold text-slate-600">
                    Webhook URL
                  </th>
                  <th className="px-4 py-3 font-semibold text-slate-600">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.map((sub: Subscription) => (
                  <tr key={sub.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono text-slate-800">
                      {sub.eventType}
                    </td>
                    <td className="px-4 py-3 break-all text-slate-600">
                      {sub.webhookUrl}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          sub.active
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {sub.active ? "active" : "inactive"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
