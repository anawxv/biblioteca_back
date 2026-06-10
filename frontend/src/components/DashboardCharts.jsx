import { ChartCard } from "./ChartCard";
import { EmptyState } from "./EmptyState";

const PINK_PALETTE = ["#ff4da6", "#ff8ac8", "#ffc2e0", "#f7a8d0", "#e84f9a", "#c12f79"];

function ChartEmpty() {
  return <div className="chart-empty">Ainda não há dados suficientes para gerar este gráfico.</div>;
}

function AreaLineChart({ points, maxValue }) {
  if (!points.length) return <ChartEmpty />;

  const width = 320;
  const height = 120;
  const padding = 8;
  const plotWidth = width - padding * 2;
  const plotHeight = height - padding * 2;
  const peak = Math.max(1, maxValue);

  const coordinates = points.map((point, index) => {
    const x = padding + (index / Math.max(points.length - 1, 1)) * plotWidth;
    const y = padding + plotHeight - (Number(point.value || 0) / peak) * plotHeight;
    return { x, y, label: point.label, value: point.value };
  });

  const linePath = coordinates.map((point, index) => `${index === 0 ? "M" : "L"}${point.x},${point.y}`).join(" ");
  const areaPath = `${linePath} L${coordinates.at(-1).x},${height - padding} L${coordinates[0].x},${height - padding} Z`;

  return (
    <div className="chart-area-wrap">
      <svg className="chart-area" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Gráfico de empréstimos por mês">
        <defs>
          <linearGradient id="areaPink" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#ff8ac8" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#ffe6f2" stopOpacity="0.05" />
          </linearGradient>
        </defs>
        <path className="chart-area__fill" d={areaPath} fill="url(#areaPink)" />
        <path className="chart-area__line" d={linePath} />
        {coordinates.map((point) => (
          <circle className="chart-area__dot" cx={point.x} cy={point.y} key={point.label} r="4.5" />
        ))}
      </svg>
      <div className="chart-area__labels">
        {coordinates.map((point) => (
          <span key={point.label}>
            <strong>{point.value}</strong>
            {point.label}
          </span>
        ))}
      </div>
    </div>
  );
}

function HorizontalBarChart({ items, maxValue, valueFormatter = (value) => value }) {
  if (!items.length) return <ChartEmpty />;

  return (
    <div className="chart-bars chart-bars--soft">
      {items.map((item, index) => (
        <div className="chart-row chart-row--wide" key={item.id || item.label}>
          <span>{item.label}</span>
          <div className="chart-row__track">
            <div
              className={`chart-row__fill${index % 2 ? " chart-row__fill--soft" : ""}`}
              style={{ width: `${(Number(item.value || 0) / maxValue) * 100}%` }}
            />
          </div>
          <strong>{valueFormatter(item.value)}</strong>
        </div>
      ))}
    </div>
  );
}

function PieChart({ items }) {
  const total = items.reduce((sum, item) => sum + Number(item.value || 0), 0);
  if (!total) return <ChartEmpty />;

  let start = 0;
  const style = {
    background: `conic-gradient(${items
      .map((item, index) => {
        const end = start + (Number(item.value || 0) / total) * 100;
        const slice = `${PINK_PALETTE[index % PINK_PALETTE.length]} ${start}% ${end}%`;
        start = end;
        return slice;
      })
      .join(", ")})`,
  };

  return (
    <div className="pie-chart-layout">
      <div className="pie-chart" style={style}>
        <div className="pie-chart__center">
          <strong>{total}</strong>
          <span>empréstimos</span>
        </div>
      </div>
      <div className="pie-legend">
        {items.map((item, index) => (
          <div className="pie-legend__item" key={item.label}>
            <span style={{ background: PINK_PALETTE[index % PINK_PALETTE.length] }} />
            <strong>{item.label}</strong>
            <small>{item.value}</small>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DashboardCharts({
  genres,
  topBooks,
  loansByMonth,
  returnsStats,
  finesByClientList,
  maxBookValue,
  maxFineValue,
  currency,
}) {
  const maxMonthValue = Math.max(1, ...loansByMonth.map((item) => item.value));
  const bookItems = topBooks.map((book) => ({
    id: book.id,
    label: book.title,
    value: book.loanCount,
  }));

  return (
    <div className="dashboard-grid dashboard-grid--charts">
      <ChartCard title="Gêneros mais consumidos">
        <PieChart items={genres} />
      </ChartCard>

      <ChartCard title="Livros mais emprestados">
        <HorizontalBarChart items={bookItems} maxValue={maxBookValue} />
      </ChartCard>

      <ChartCard title="Empréstimos por mês">
        <AreaLineChart points={loansByMonth} maxValue={maxMonthValue} />
      </ChartCard>

      <ChartCard title="Devoluções no prazo x atrasadas">
        {returnsStats?.onTime || returnsStats?.late ? (
          <div className="returns-chart">
            <div className="returns-chart__bar">
              <div
                className="returns-chart__segment returns-chart__segment--on-time"
                style={{
                  width: `${(returnsStats.onTime / (returnsStats.onTime + returnsStats.late || 1)) * 100}%`,
                }}
              >
                No prazo: {returnsStats.onTime}
              </div>
              <div
                className="returns-chart__segment returns-chart__segment--late"
                style={{
                  width: `${(returnsStats.late / (returnsStats.onTime + returnsStats.late || 1)) * 100}%`,
                }}
              >
                Atrasadas: {returnsStats.late}
              </div>
            </div>
            <div className="returns-chart__legend">
              <span><i className="returns-chart__dot returns-chart__dot--on-time" /> No prazo</span>
              <span><i className="returns-chart__dot returns-chart__dot--late" /> Atrasadas</span>
            </div>
          </div>
        ) : (
          <EmptyState title="Sem devoluções registradas" description="Os indicadores aparecerão assim que houver movimentação." />
        )}
      </ChartCard>

      <ChartCard title="Multas pendentes por cliente">
        <HorizontalBarChart
          items={finesByClientList.slice(0, 8).map((item) => ({
            id: item.id,
            label: item.label,
            value: item.value,
          }))}
          maxValue={maxFineValue}
          valueFormatter={currency}
        />
      </ChartCard>
    </div>
  );
}
