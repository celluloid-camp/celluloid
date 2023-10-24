import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";

interface RouteHistoryContextProps {
  historyStack: string[];
}

const RouteHistoryContext = createContext<RouteHistoryContextProps | undefined>(
  undefined
);

export const useRouteHistory = (): RouteHistoryContextProps => {
  const context = useContext(RouteHistoryContext);
  if (!context) {
    throw new Error(
      "useRouteHistory must be used within a RouteHistoryProvider"
    );
  }
  return context;
};

export const usePreviousLocation = (): string => {
  const { historyStack } = useContext(
    RouteHistoryContext
  ) as RouteHistoryContextProps;

  if (!historyStack) {
    throw new Error(
      "usePreviousLocation must be used within a RouteHistoryProvider"
    );
  }

  for (let i = historyStack.length - 1; i >= 0; i--) {
    const route = historyStack[i];
    if (
      ![
        "/login",
        "/signup",
        "/recover",
        "/confirm",
        "/forgot",
        "/signup-student",
        "/join",
        "/forgot",
      ].includes(route)
    ) {
      return route;
    }
  }

  return "/"; // Default route if no suitable previous location is found
};

interface RouteHistoryProviderProps {
  children: ReactNode;
}

export const RouteHistoryProvider: React.FC<RouteHistoryProviderProps> = ({
  children,
}) => {
  const [historyStack, setHistoryStack] = useState<string[]>([]);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Assuming 'navigate.listen' is a hypothetical function. This part might differ based on your actual router implementation
    const unsubscribe = navigate((crntLocation, action) => {
      if (action === "REPLACE") {
        setHistoryStack((prevHistory) => {
          const newHistory = [...prevHistory];
          newHistory[newHistory.length - 1] = location.pathname;
          return newHistory;
        });
      } else if (action === "PUSH") {
        setHistoryStack((prevHistory) => [...prevHistory, location.pathname]);
      }
    });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [location, navigate]);

  return (
    <RouteHistoryContext.Provider value={{ historyStack }}>
      {children}
    </RouteHistoryContext.Provider>
  );
};
