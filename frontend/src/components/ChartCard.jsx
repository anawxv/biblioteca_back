export function ChartCard({ title, children }) {
  return (
    <section className="chart-card">
      <div className="section-heading">
        <h2>{title}</h2>
      </div>
      {children}
    </section>
  );
}
