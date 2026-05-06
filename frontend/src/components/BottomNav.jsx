import { NavLink } from "react-router-dom";

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
  const items = isAdmin ? adminItems : customerItems;

  return (
    <nav className="bottom-nav">
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
    </nav>
  );
}
