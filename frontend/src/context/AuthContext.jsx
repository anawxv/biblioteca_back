import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { cadastrarUsuario, login as loginRequest } from "../services/api";

const AuthContext = createContext(null);

const AUTH_KEY = "biblioteca-auth";
const FAVORITES_KEY = "biblioteca-favorites";
const ROLE_KEY = "biblioteca-role";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [preferredRole, setPreferredRole] = useState("cliente");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedAuth = localStorage.getItem(AUTH_KEY);
    const storedFavorites = localStorage.getItem(FAVORITES_KEY);
    const storedRole = localStorage.getItem(ROLE_KEY);

    if (storedAuth) {
      const parsedAuth = JSON.parse(storedAuth);
      setUser(parsedAuth.user);
    }

    if (storedFavorites) {
      setFavorites(JSON.parse(storedFavorites));
    }

    if (storedRole) {
      setPreferredRole(storedRole);
    }

    setLoading(false);
  }, []);

  const persistAuth = (payload) => {
    localStorage.setItem(AUTH_KEY, JSON.stringify(payload));
    setUser(payload.user);
  };

  const login = async (credentials) => {
    const response = await loginRequest(credentials);
    persistAuth(response);
    return response;
  };

  const register = async (payload) => {
    const response = await cadastrarUsuario(payload);
    const authPayload = {
      token: `mock-token-${response.user.id}`,
      user: response.user,
    };
    persistAuth(authPayload);
    return response;
  };

  const logout = () => {
    localStorage.removeItem(AUTH_KEY);
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
          token: `mock-token-${nextUser.id}`,
          user: nextUser,
        }),
      );
      return nextUser;
    });
  };

  const definePreferredRole = (role) => {
    localStorage.setItem(ROLE_KEY, role);
    setPreferredRole(role);
  };

  const value = useMemo(
    () => ({
      user,
      favorites,
      preferredRole,
      loading,
      login,
      register,
      logout,
      toggleFavorite,
      updateProfile,
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
