export function MetricCard({ icon, label, value, soft = false }) {
  return (
    <article className={`metric-card${soft ? " metric-card--soft" : ""}`}>
      <div className="metric-card__icon">{icon}</div>
      <div>
        <h3>{value}</h3>
        <p>{label}</p>
      </div>
    </article>
  );
}
