"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { use } from "react";
import { Field } from "@/components/field";
import { StatusBadge } from "@/components/status.badge";
import { getEvent, type DeliveryLog } from "@/lib/api";

export default function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const eventId = parseInt(id, 10);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["event", eventId],
    queryFn: () => getEvent(eventId),
    enabled: !isNaN(eventId),
  });

  if (isLoading) {
    return <p className="text-slate-400">Loading event…</p>;
  }

  if (isError) {
    return <p className="text-red-500">{(error as Error).message}</p>;
  }

  if (!data) return null;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/" className="text-sm text-slate-400 hover:text-slate-600">
          ← Dashboard
        </Link>
        <span className="text-slate-300">/</span>
        <span className="text-sm text-slate-600">Event #{data.id}</span>
      </div>

      <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <h1 className="font-mono text-xl font-bold text-slate-800">
            {data.type}
          </h1>
          <StatusBadge status={data.status} />
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <Field label="ID" value={String(data.id)} />
          <Field label="Status" value={data.status} />
          <Field
            label="Created"
            value={new Date(data.createdAt).toLocaleString()}
          />
        </div>

        <div>
          <p className="mb-1 text-xs font-semibold tracking-wide text-slate-500 uppercase">
            Payload
          </p>
          <pre className="overflow-auto rounded-lg border border-slate-200 bg-slate-50 p-4 font-mono text-sm text-slate-700">
            {JSON.stringify(data.payload, null, 2)}
          </pre>
        </div>
      </div>

      <section>
        <h2 className="mb-3 text-sm font-semibold tracking-wide text-slate-500 uppercase">
          Delivery Logs ({data.deliveryLogs.length})
        </h2>
        {data.deliveryLogs.length === 0 ? (
          <p className="text-sm text-slate-400">No delivery attempts yet.</p>
        ) : (
          <div className="space-y-3">
            {data.deliveryLogs.map((log: DeliveryLog) => (
              <div
                key={log.id}
                className="space-y-2 rounded-xl border border-slate-200 bg-white p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={log.status} />
                    <span className="text-xs text-slate-400">
                      Attempt {log.attempt}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400">
                    {new Date(log.createdAt).toLocaleString()}
                  </span>
                </div>
                {log.responseCode != null && (
                  <p className="text-sm text-slate-600">
                    HTTP{" "}
                    <span className="font-mono font-semibold">
                      {log.responseCode === 0
                        ? "network error"
                        : log.responseCode}
                    </span>
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
