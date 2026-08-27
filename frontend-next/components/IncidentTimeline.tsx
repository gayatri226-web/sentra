import { HiOutlineUserAdd, HiOutlineChartBar, HiOutlineMoon, HiOutlineSwitchHorizontal, HiOutlineCamera, HiOutlineGlobeAlt } from "react-icons/hi";
import type { IconType } from "react-icons";
import type { Incident } from "@/lib/types";
import { SIGNAL_LABELS } from "@/lib/types";

const SIGNAL_ICON: Record<string, IconType> = {
  new_contact: HiOutlineUserAdd,
  message_burst: HiOutlineChartBar,
  late_night_activity: HiOutlineMoon,
  cross_app_transition: HiOutlineSwitchHorizontal,
  identity_flag: HiOutlineCamera,
  known_threat_domain: HiOutlineGlobeAlt,
};

const SIGNAL_WEIGHT: Record<string, number> = {
  new_contact: 15,
  message_burst: 30,
  late_night_activity: 20,
  cross_app_transition: 35,
  identity_flag: 20,
  known_threat_domain: 100,
};

/**
 * Renders the exact sequence of signals that produced this incident's
 * score. Nothing here is invented for display — it's built directly from
 * `incident.signals_considered`, which is the real rolling window the
 * backend scored against.
 */
export default function IncidentTimeline({ incident }: { incident: Incident }) {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {incident.signals_considered.map((signal, idx) => {
        const Icon = SIGNAL_ICON[signal];
        return (
        <div
          key={`${signal}-${idx}`}
          style={{
            display: "flex",
            gap: 14,
            padding: "14px 0",
            borderBottom:
              idx === incident.signals_considered.length - 1
                ? "none"
                : "1px solid var(--grid)",
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 15,
              flexShrink: 0,
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
            }}
          >
            {Icon ? <Icon size={16} color="var(--ink-2)" /> : "•"}
          </div>
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              {SIGNAL_LABELS[signal as keyof typeof SIGNAL_LABELS] ?? signal}
              <span
                style={{
                  fontSize: 10.5,
                  fontWeight: 700,
                  padding: "2px 7px",
                  borderRadius: 10,
                  background: "rgba(239,68,68,0.16)",
                  color: "var(--critical)",
                }}
              >
                +{SIGNAL_WEIGHT[signal] ?? 0}
              </span>
            </div>
          </div>
        </div>
        );
      })}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          paddingTop: 14,
          fontSize: 13,
          fontWeight: 700,
        }}
      >
        <span>Total risk score</span>
        <span>{incident.score} / 100</span>
      </div>
    </div>
  );
}
