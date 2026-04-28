import { useNavigate } from "react-router-dom";

export function TopBar({ title, subtitle, action }) {
  const navigate = useNavigate();

  return (
    <header className="topbar">
      <button className="icon-button icon-button--ghost" onClick={() => navigate(-1)} type="button">
        ←
      </button>
      <div className="topbar__content">
        <h1>{title}</h1>
        {subtitle ? <p>{subtitle}</p> : null}
      </div>
      {action ? <div className="topbar__action">{action}</div> : <div className="topbar__spacer" />}
    </header>
  );
}
