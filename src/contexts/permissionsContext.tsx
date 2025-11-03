'use client';
import React, { createContext, useReducer, useEffect } from 'react';
import { useUI } from './ui.context';

// Define permission structure
type PermissionActions = 'Create' | 'View' | 'Update' | 'Delete';

type PermissionsState = {
  [module: string]: Record<PermissionActions, boolean>;
};

// Define action types
type PermissionsAction =
  | { type: 'SET_PERMISSIONS'; payload: PermissionsState }
  | { type: 'CLEAR_PERMISSIONS' };

// Reducer function
const permissionsReducer = (
  state: PermissionsState,
  action: PermissionsAction,
): PermissionsState => {
  switch (action.type) {
    case 'SET_PERMISSIONS':
      return action.payload;
    case 'CLEAR_PERMISSIONS':
      return {};
    default:
      return state;
  }
};

// Load permissions from localStorage
const loadPermissionsFromStorage = (): PermissionsState => {
  if (typeof window !== 'undefined') {
    try {
      const storedPermissions = localStorage.getItem('userPermissions');
      return storedPermissions ? JSON.parse(storedPermissions) : {};
    } catch (error) {
      console.error('Error loading permissions from storage:', error);
      return {};
    }
  }
  return {};
};

// Context interface
interface PermissionsContextType {
  permissions: PermissionsState | any;
  setPermissions: (permissions: PermissionsState | any) => void;
  clearPermissions: () => void;
  hasPermission: (module: string, action: PermissionActions) => boolean;
}

// Create Context
export const PermissionsContext = createContext<
  PermissionsContextType | undefined | any
>(undefined);

// Provider Component
export const PermissionsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [permissions, dispatch] = useReducer(
    permissionsReducer,
    {},
    loadPermissionsFromStorage,
  );
  const { isAuthorized } = useUI();

  // Save permissions to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (!isAuthorized) {
        localStorage.setItem('userPermissions', JSON.stringify({}));
      }
      localStorage.setItem('userPermissions', JSON.stringify(permissions));
    }
  }, [permissions, isAuthorized]);

  // Function to set permissions
  const setPermissions = (newPermissions: PermissionsState) => {
    dispatch({ type: 'SET_PERMISSIONS', payload: newPermissions });
  };

  // Function to clear permissions
  const clearPermissions = () => {
    dispatch({ type: 'CLEAR_PERMISSIONS' });
    if (typeof window !== 'undefined') {
      localStorage.removeItem('userPermissions');
    }
  };

  // Function to check if user has permission for a specific module and action
  const hasPermission = (module: string, action: PermissionActions) => {
    return permissions[module]?.[action] || false;
  };

  return (
    <PermissionsContext.Provider
      value={{ permissions, setPermissions, clearPermissions, hasPermission }}
    >
      {children}
    </PermissionsContext.Provider>
  );
};
