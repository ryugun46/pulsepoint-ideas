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
  globalTimeframe: string;
  setGlobalTimeframe: (timeframe: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  // Auto-login with mock user for demo purposes
  const [user, setUser] = useState<User | null>(mockUser);
  const [collections, setCollections] = useState<Collection[]>(mockCollections);
  const [analyses, setAnalyses] = useState<Analysis[]>(mockAnalyses);
  const [ideas, setIdeas] = useState<Idea[]>(mockIdeas);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [globalTimeframe, setGlobalTimeframe] = useState('7d');

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
        globalTimeframe,
        setGlobalTimeframe,
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

export function useMockLogin() {
  const { setUser } = useApp();
  return () => setUser(mockUser);
}
