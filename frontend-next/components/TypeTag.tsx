import type { SignalCategory } from "@/lib/types";

const CATEGORY_COLOR: Record<SignalCategory, string> = {
  network: "var(--type-network)",
  behavioral: "var(--type-behavioral)",
  identity: "var(--type-identity)",
};

const CATEGORY_LABEL: Record<SignalCategory, string> = {
  network: "Network",
  behavioral: "Behavioral",
  identity: "Identity",
};

export default function TypeTag({ category }: { category: SignalCategory }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontSize: 11.5,
        color: "var(--ink-2)",
      }}
    >
      <i
        style={{
          width: 7,
          height: 7,
          borderRadius: 2,
          background: CATEGORY_COLOR[category],
          display: "inline-block",
        }}
      />
      {CATEGORY_LABEL[category]}
    </span>
  );
}
