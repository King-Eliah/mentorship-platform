import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Goal {
  id: string;
  title: string;
  description: string;
  deadline: string;
  createdAt: string;
  status: 'pending' | 'completed';
}

interface GoalContextType {
  goals: Goal[];
  setGoals: React.Dispatch<React.SetStateAction<Goal[]>>;
  addGoal: (goal: Omit<Goal, 'id' | 'createdAt'>) => void;
  deleteGoal: (goalId: string) => void;
  toggleGoalStatus: (goalId: string) => void;
  getRecentGoals: (limit?: number) => Goal[];
}

const GoalContext = createContext<GoalContextType | undefined>(undefined);

export const useGoals = () => {
  const context = useContext(GoalContext);
  if (context === undefined) {
    throw new Error('useGoals must be used within a GoalProvider');
  }
  return context;
};

interface GoalProviderProps {
  children: ReactNode;
}

export const GoalProvider: React.FC<GoalProviderProps> = ({ children }) => {
  const [goals, setGoals] = useState<Goal[]>([]);

  const addGoal = (goalData: Omit<Goal, 'id' | 'createdAt'>) => {
    const newGoal: Goal = {
      ...goalData,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
    };
    setGoals(prev => [...prev, newGoal]);
  };

  const deleteGoal = (goalId: string) => {
    setGoals(prev => prev.filter(goal => goal.id !== goalId));
  };

  const toggleGoalStatus = (goalId: string) => {
    setGoals(prev => prev.map(goal => 
      goal.id === goalId 
        ? { ...goal, status: goal.status === 'pending' ? 'completed' : 'pending' }
        : goal
    ));
  };

  const getRecentGoals = (limit = 4) => {
    return goals
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  };

  const value: GoalContextType = {
    goals,
    setGoals,
    addGoal,
    deleteGoal,
    toggleGoalStatus,
    getRecentGoals,
  };

  return <GoalContext.Provider value={value}>{children}</GoalContext.Provider>;
};