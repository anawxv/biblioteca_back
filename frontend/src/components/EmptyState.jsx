export function EmptyState({ title, description }) {
  return (
    <div className="empty-state">
      <div className="empty-state__icon">✦</div>
      <strong>{title}</strong>
      <p>{description}</p>
    </div>
  );
}
