export default function Sparkline({
  values,
  color = "var(--brand)",
}: {
  values: number[];
  color?: string;
}) {
  if (values.length === 0) return null;
  const max = Math.max(...values, 1);
  const width = 100;
  const height = 28;
  const step = width / (values.length - 1 || 1);

  const points = values
    .map((v, i) => `${i * step},${height - (v / max) * height}`)
    .join(" ");

  const areaPoints = `0,${height} ${points} ${width},${height}`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height} preserveAspectRatio="none">
      <polygon points={areaPoints} fill={color} opacity={0.12} />
      <polyline points={points} fill="none" stroke={color} strokeWidth={1.5} />
    </svg>
  );
}