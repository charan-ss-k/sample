
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { toast } from "@/components/ui/use-toast";

type User = {
  name: string;
  email: string;
  isAuthenticated: boolean;
  role: string;
  sessionExpiry: number; // Timestamp when session expires
} | null;

interface AuthContextProps {
  user: User;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
  resetPassword: (email: string) => Promise<void>;
  isLoading: boolean;
  isPublisher: boolean;
}

// Define the user database structure
interface UserData {
  name: string;
  email: string;
  password: string;
  role: string;
}

const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes in milliseconds
const SESSION_CHECK_INTERVAL = 60 * 1000; // Check every minute

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPublisher, setIsPublisher] = useState(false);
  
  // Initialize demo users if no user database exists
  useEffect(() => {
    if (!localStorage.getItem('userDatabase')) {
      const demoUsers = [
        { name: "John Doe", email: "john@example.com", password: "password123", role: "publisher" },
        { name: "Jane Smith", email: "jane@example.com", password: "password123", role: "respondent" }
      ];
      localStorage.setItem('userDatabase', JSON.stringify(demoUsers));
    }
  }, []);

  // Set up session timeout check
  useEffect(() => {
    const checkSession = () => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          if (parsedUser.sessionExpiry && Date.now() > parsedUser.sessionExpiry) {
            // Session expired
            signOut();
            toast({
              title: "Session expired",
              description: "Your session has expired. Please sign in again.",
            });
          }
        } catch (error) {
          console.error("Error checking session:", error);
        }
      }
    };

    const interval = setInterval(checkSession, SESSION_CHECK_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Check for stored user on initialization
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        
        // Check if session is still valid
        if (parsedUser.sessionExpiry && Date.now() > parsedUser.sessionExpiry) {
          // Session expired
          localStorage.removeItem('user');
          toast({
            title: "Session expired",
            description: "Your session has expired. Please sign in again.",
          });
        } else {
          setUser(parsedUser);
          setIsPublisher(parsedUser.role === "publisher");
        }
      } catch (error) {
        console.error("Error parsing stored user:", error);
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  const getUserDatabase = (): UserData[] => {
    const dbString = localStorage.getItem('userDatabase') || '[]';
    try {
      return JSON.parse(dbString);
    } catch (error) {
      console.error("Error parsing user database:", error);
      return [];
    }
  };

  const signIn = async (email: string, password: string) => {
    const userDb = getUserDatabase();
    
    // Find user in our database
    const existingUser = userDb.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!existingUser) {
      throw new Error("No account found with this email");
    }
    
    if (existingUser.password !== password) {
      throw new Error("Invalid password");
    }
    
    // Calculate session expiry time (current time + 30 minutes)
    const sessionExpiry = Date.now() + SESSION_TIMEOUT_MS;
    
    const newUser = {
      name: existingUser.name,
      email: existingUser.email,
      isAuthenticated: true,
      role: existingUser.role,
      sessionExpiry: sessionExpiry
    };
    
    setUser(newUser);
    setIsPublisher(existingUser.role === "publisher");
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  const signOut = () => {
    setUser(null);
    setIsPublisher(false);
    localStorage.removeItem('user');
  };
  
  const resetPassword = async (email: string) => {
    const userDb = getUserDatabase();
    
    // Check if user exists in our database
    const existingUser = userDb.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!existingUser) {
      throw new Error("No account found with this email");
    }
    
    // In a real app, you would send an email here
    // For demo, we'll just show a success message
    toast({
      title: "Password reset email sent",
      description: `Check ${email} for instructions to reset your password`,
    });
    
    // For demo purposes, let's "reset" the password to a known value
    const updatedUserDb = userDb.map(u => {
      if (u.email.toLowerCase() === email.toLowerCase()) {
        return { ...u, password: "resetpass123" };
      }
      return u;
    });
    
    localStorage.setItem('userDatabase', JSON.stringify(updatedUserDb));
    console.log(`Password for ${email} reset to "resetpass123"`);
  };

  return (
    <AuthContext.Provider value={{ user, signIn, signOut, resetPassword, isLoading, isPublisher }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
