import { createContext, useContext, useState, ReactNode } from 'react';
import type { User, Collection, Analysis, Idea } from '@/types';
import { mockUser, mockCollections, mockAnalyses, mockIdeas } from '@/data/mockData';

interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isAuthenticated: boolean;
  collections: Collection[];
  setCollections: (collections: Collection[]) => void;
  analyses: Analysis[];
  setAnalyses: (analyses: Analysis[]) => void;
  ideas: Idea[];
  setIdeas: (ideas: Idea[]) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [collections, setCollections] = useState<Collection[]>(mockCollections);
  const [analyses, setAnalyses] = useState<Analysis[]>(mockAnalyses);
  const [ideas, setIdeas] = useState<Idea[]>(mockIdeas);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const isAuthenticated = user !== null;

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        isAuthenticated,
        collections,
        setCollections,
        analyses,
        setAnalyses,
        ideas,
        setIdeas,
        sidebarOpen,
        setSidebarOpen,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

// Helper to simulate login with mock user
export function useMockLogin() {
  const { setUser } = useApp();
  return () => setUser(mockUser);
}
