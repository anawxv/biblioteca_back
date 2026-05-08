import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const customerItems = [
  { to: "/cliente/catalogo", label: "Catálogo", icon: "⌂" },
  { to: "/cliente/categorias", label: "Categorias", icon: "▦" },
  { to: "/cliente/emprestimos", label: "Empréstimos", icon: "◫" },
  { to: "/cliente/perfil", label: "Perfil", icon: "○" },
];

const adminItems = [
  { to: "/funcionario/painel", label: "Painel", icon: "⌂" },
  { to: "/funcionario/gerenciar-livros", label: "Livros", icon: "▦" },
  { to: "/funcionario/controlar-emprestimos", label: "Empréstimos", icon: "◫" },
  { to: "/funcionario/dashboard", label: "Dashboard", icon: "○" },
];

export function BottomNav({ isAdmin = false }) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const items = isAdmin ? adminItems : customerItems;

  function handleLogout() {
    logout();
    localStorage.clear();
    sessionStorage.clear();
    navigate("/login", { replace: true });
  }

  return (
    <nav className={`bottom-nav${isAdmin ? " bottom-nav--admin" : ""}`}>
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `bottom-nav__item${isActive ? " bottom-nav__item--active" : ""}`
          }
        >
          <span className="bottom-nav__icon">{item.icon}</span>
          <span>{item.label}</span>
        </NavLink>
      ))}
      {isAdmin ? (
        <button className="bottom-nav__item bottom-nav__item--button" onClick={handleLogout} type="button">
          <span className="bottom-nav__icon">↩</span>
          <span>Sair</span>
        </button>
      ) : null}
    </nav>
  );
}
