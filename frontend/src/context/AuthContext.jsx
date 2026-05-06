import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { cadastrarUsuario, login as loginRequest } from "../services/api";

const AuthContext = createContext(null);

const AUTH_KEY = "biblioteca-auth";
const FAVORITES_KEY = "biblioteca-favorites";
const ROLE_KEY = "biblioteca-role";

function normalizeUserRole(role) {
  return String(role || "").toLowerCase() === "funcionario" ? "funcionario" : "cliente";
}

function normalizePreferredRole(role) {
  if (!role) {
    return null;
  }

  const normalized = String(role).toLowerCase();
  if (normalized === "cliente" || normalized === "funcionario") {
    return normalized;
  }

  return null;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [preferredRole, setPreferredRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedAuth = localStorage.getItem(AUTH_KEY);
    const storedFavorites = localStorage.getItem(FAVORITES_KEY);
    const storedRole = localStorage.getItem(ROLE_KEY);

    if (storedAuth) {
      try {
        const parsedAuth = JSON.parse(storedAuth);
        if (parsedAuth?.user?.id && parsedAuth?.user?.role) {
          setUser({
            ...parsedAuth.user,
            role: normalizeUserRole(parsedAuth.user.role),
          });
        }
      } catch {
        localStorage.removeItem(AUTH_KEY);
      }
    }

    if (storedFavorites) {
      setFavorites(JSON.parse(storedFavorites));
    }

    if (storedRole) {
      setPreferredRole(normalizePreferredRole(storedRole));
    }

    setLoading(false);
  }, []);

  const persistAuth = (payload) => {
    const normalizedPayload = {
      ...payload,
      user: {
        ...payload.user,
        role: normalizeUserRole(payload.user.role),
      },
    };
    localStorage.setItem(AUTH_KEY, JSON.stringify(normalizedPayload));
    setUser(normalizedPayload.user);
  };

  const login = async (credentials) => {
    if (!preferredRole) {
      throw new Error("Tipo de acesso nao identificado. Volte e escolha cliente ou funcionario.");
    }

    const response = await loginRequest(credentials);
    const responseRole = normalizeUserRole(response.user.role);
    const expectedRole = normalizePreferredRole(preferredRole);

    if (responseRole !== expectedRole) {
      throw new Error(
        expectedRole === "cliente"
          ? "Este usuário não é cliente. Volte e escolha Sou funcionário."
          : "Este usuário não é funcionário. Volte e escolha Sou cliente.",
      );
    }

    const normalizedResponse = {
      ...response,
      user: {
        ...response.user,
        role: responseRole,
      },
    };
    persistAuth(normalizedResponse);
    return normalizedResponse;
  };

  const register = async (payload) => {
    const role = normalizePreferredRole(payload.role || preferredRole);
    if (!role) {
      throw new Error("Tipo de cadastro nao identificado. Volte e escolha cliente ou funcionario.");
    }

    return cadastrarUsuario({
      ...payload,
      role,
      tipoUsuario: role.toUpperCase(),
    });
  };

  const logout = () => {
    localStorage.removeItem(AUTH_KEY);
    sessionStorage.removeItem(AUTH_KEY);
    setUser(null);
  };

  const toggleFavorite = (bookId) => {
    setFavorites((current) => {
      const exists = current.includes(bookId);
      const nextFavorites = exists
        ? current.filter((id) => id !== bookId)
        : [...current, bookId];

      localStorage.setItem(FAVORITES_KEY, JSON.stringify(nextFavorites));
      return nextFavorites;
    });
  };

  const updateProfile = (partialUser) => {
    setUser((currentUser) => {
      const nextUser = {
        ...currentUser,
        ...partialUser,
      };
      localStorage.setItem(
        AUTH_KEY,
        JSON.stringify({
          token: `session-${nextUser.id}`,
          user: nextUser,
        }),
      );
      return nextUser;
    });
  };

  const updateProfilePhoto = (photoDataUrl) => {
    updateProfile({ photoUrl: photoDataUrl });
  };

  const definePreferredRole = (role) => {
    const normalizedRole = normalizePreferredRole(role);
    if (!normalizedRole) {
      localStorage.removeItem(ROLE_KEY);
      setPreferredRole(null);
      return;
    }

    localStorage.setItem(ROLE_KEY, normalizedRole);
    setPreferredRole(normalizedRole);
  };

  const value = useMemo(
    () => ({
      user,
      tipoUsuario: user?.role?.toUpperCase() || null,
      favorites,
      preferredRole,
      loading,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
      toggleFavorite,
      updateProfile,
      updateProfilePhoto,
      definePreferredRole,
      isFavorite: (bookId) => favorites.includes(bookId),
    }),
    [favorites, loading, preferredRole, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider.");
  }

  return context;
}
