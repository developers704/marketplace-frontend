'use client';

import React, {
  createContext,
  useReducer,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import Cookies from 'js-cookie';
import { io, Socket } from 'socket.io-client';
import { useUI } from './ui.context';
import { getSocketOrigin } from '@/lib/socket-origin';

export type PermissionActions = 'Create' | 'View' | 'Update' | 'Delete';

export type PermissionsState = {
  [module: string]: Partial<Record<PermissionActions, boolean>>;
};

type PermissionsAction =
  | { type: 'SET_PERMISSIONS'; payload: PermissionsState }
  | { type: 'CLEAR_PERMISSIONS' };

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

/** Build nested module map from API flat keys `Module:Action` → true */
function flatPermissionsToNested(
  flat: Record<string, boolean> | undefined,
): PermissionsState {
  const nested: PermissionsState = {};
  if (!flat || typeof flat !== 'object') return nested;
  for (const key of Object.keys(flat)) {
    if (!flat[key]) continue;
    const i = key.indexOf(':');
    if (i === -1) continue;
    const mod = key.slice(0, i);
    const act = key.slice(i + 1) as PermissionActions;
    if (!nested[mod]) nested[mod] = {};
    nested[mod]![act] = true;
  }
  return nested;
}

function getAuthToken(): string {
  if (typeof window === 'undefined') return '';
  return (
    Cookies.get('auth_token') ||
    localStorage.getItem('auth_token') ||
    ''
  );
}

export interface PermissionsContextType {
  permissions: PermissionsState;
  roles: string[];
  isAdmin: boolean;
  loadingPermissions: boolean;
  refreshPermissions: () => Promise<void>;
  /** Legacy name — sets in-memory module permissions only (no localStorage). */
  setPermissions: (p: PermissionsState | Record<string, unknown>) => void;
  clearPermissions: () => void;
  hasPermission: (module: string, action: PermissionActions) => boolean;
}

export const PermissionsContext = createContext<
  PermissionsContextType | undefined | any
>(undefined);

export const PermissionsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [permissions, dispatch] = useReducer(permissionsReducer, {});
  const [roles, setRoles] = React.useState<string[]>([]);
  const [isAdmin, setIsAdmin] = React.useState(false);
  const [loadingPermissions, setLoadingPermissions] = React.useState(false);
  const { isAuthorized } = useUI();
  const socketRef = useRef<Socket | null>(null);
  const refreshAbortRef = useRef<AbortController | null>(null);
  const socketDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearPermissions = useCallback(() => {
    dispatch({ type: 'CLEAR_PERMISSIONS' });
    setRoles([]);
    setIsAdmin(false);
  }, []);

  const refreshPermissions = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      clearPermissions();
      return;
    }
    refreshAbortRef.current?.abort();
    const ac = new AbortController();
    refreshAbortRef.current = ac;

    const BASE_API = process.env.NEXT_PUBLIC_BASE_API || '';
    setLoadingPermissions(true);
    try {
      const res = await fetch(`${BASE_API}/api/auth/permissions`, {
        signal: ac.signal,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (res.status === 401) {
        clearPermissions();
        return;
      }
      if (!res.ok) {
        if (res.status === 403) {
          clearPermissions();
        }
        return;
      }
      const data = await res.json();
      setRoles(Array.isArray(data.roles) ? [...new Set(data.roles)] : []);
      setIsAdmin(!!data.isAdmin);
      dispatch({
        type: 'SET_PERMISSIONS',
        payload: flatPermissionsToNested(data.permissions),
      });
    } catch (e: unknown) {
      if (e instanceof Error && e.name === 'AbortError') return;
      console.error('refreshPermissions', e);
    } finally {
      if (refreshAbortRef.current === ac) {
        setLoadingPermissions(false);
      }
    }
  }, [clearPermissions]);

  const setPermissions = useCallback(
    (newPermissions: PermissionsState | Record<string, unknown>) => {
      dispatch({
        type: 'SET_PERMISSIONS',
        payload: newPermissions as PermissionsState,
      });
    },
    [],
  );

  const hasPermission = useCallback(
    (module: string, action: PermissionActions) => {
      if (isAdmin) return true;
      return !!permissions[module]?.[action];
    },
    [permissions, isAdmin],
  );

  // Drop legacy persisted permissions (security); keep auth token only.
  useEffect(() => {
    try {
      localStorage.removeItem('userPermissions');
    } catch (_) {
      /* ignore */
    }
  }, []);

  // Load permissions when session becomes authorized or on full page load with token.
  useEffect(() => {
    if (!isAuthorized) {
      clearPermissions();
      return;
    }
    void refreshPermissions();
  }, [isAuthorized, refreshPermissions, clearPermissions]);

  // Real-time updates when admin changes role/permissions (same Socket.IO server as imports/chat).
  useEffect(() => {
    if (!isAuthorized) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }
    const token = getAuthToken();
    if (!token) return;

    const BASE_API = process.env.NEXT_PUBLIC_BASE_API || '';
    const origin = getSocketOrigin(BASE_API);
    const socket = io(origin, {
      transports: ['websocket', 'polling'],
      auth: { token },
    });
    socketRef.current = socket;

    const runRefresh = () => {
      if (socketDebounceRef.current) clearTimeout(socketDebounceRef.current);
      socketDebounceRef.current = setTimeout(() => {
        socketDebounceRef.current = null;
        void refreshPermissions();
      }, 120);
    };

    socket.on('permissions-updated', runRefresh);

    return () => {
      if (socketDebounceRef.current) clearTimeout(socketDebounceRef.current);
      socket.off('permissions-updated', runRefresh);
      socket.disconnect();
      if (socketRef.current === socket) socketRef.current = null;
    };
  }, [isAuthorized, refreshPermissions]);

  const value = useMemo(
    () => ({
      permissions,
      roles,
      isAdmin,
      loadingPermissions,
      refreshPermissions,
      setPermissions,
      clearPermissions,
      hasPermission,
    }),
    [
      permissions,
      roles,
      isAdmin,
      loadingPermissions,
      refreshPermissions,
      setPermissions,
      clearPermissions,
      hasPermission,
    ],
  );

  return (
    <PermissionsContext.Provider value={value}>
      {children}
    </PermissionsContext.Provider>
  );
};
