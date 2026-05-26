import axios from "axios";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import toast, { Toaster } from "react-hot-toast";
import type { AppContextType, User } from "../types";
import { backendUrl } from "../App";

// Creates global context container
// Why undefined? Initially context has no value until Provider wraps app
const AppContext = createContext<AppContextType | undefined>(undefined);

// Defines props for provider
interface AppProps {
  children: ReactNode;
}

// AppProvider Component- Wraps entire app and provides global data
export const AppProvider = ({ children }: AppProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);

  // Gets logged-in user profile from backend
  async function fetchUser() {
    try {
      // Calls backend profile route
      const { data } = await axios.get(`${backendUrl}/api/user/get-profile`, {
        headers: {
          // Sends JWT token
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      // Stores authenticated user globally
      setUser(data);
      setIsAuth(true);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  // Logout Function
  const LogoutUser = () => {
    // Clears JWT token.
    localStorage.setItem("token", "");

    // Removes user state
    setUser(null);
    setIsAuth(false);

    toast.success("Logged Out");
  };

  // Runs ONCE when app loads
  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <AppContext.Provider
      value={{
        isAuth,
        loading,
        setIsAuth,
        setLoading,
        setUser,
        user,
        LogoutUser,
      }}
    >
      {children}

      {/* Enables toast notifications globally */}
      <Toaster />
    </AppContext.Provider>
  );
};

// Creates reusable context hook
export const useAppData = (): AppContextType => {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error("Context provider is missing");
  }

  return context;
};
