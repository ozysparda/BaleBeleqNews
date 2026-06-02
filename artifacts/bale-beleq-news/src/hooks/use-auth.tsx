import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User } from "@workspace/api-client-react/src/generated/api.schemas";
import { setAuthTokenGetter } from "@workspace/api-client-react";

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem("bbn_token");
    const storedUser = localStorage.getItem("bbn_user");

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem("bbn_token");
        localStorage.removeItem("bbn_user");
      }
    }
    
    // Set token getter for custom fetch
    setAuthTokenGetter(() => localStorage.getItem("bbn_token"));
    
    setIsInitialized(true);
  }, []);

  const login = (newUser: User, newToken: string) => {
    localStorage.setItem("bbn_token", newToken);
    localStorage.setItem("bbn_user", JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem("bbn_token");
    localStorage.removeItem("bbn_user");
    setToken(null);
    setUser(null);
  };

  if (!isInitialized) return null;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}