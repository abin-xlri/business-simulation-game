import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { toast } from 'react-hot-toast'
import { io, Socket } from 'socket.io-client'
import { 
  GameState, 
  Player, 
  GameEvent, 
  Notification, 
  CompanyAction, 
  GameRequest 
} from '../types/game'

interface SocketContextType {
  socket: Socket | null
  isConnected: boolean
  gameState: GameState | null
  player: Player | null
  joinGame: (playerId: string) => void
  updatePlayer: (playerData: Partial<Player>) => void
  performCompanyAction: (action: CompanyAction) => void
  requestGameData: (request: GameRequest) => void
  // Direct socket access for advanced usage
  emit: (event: string, data?: any) => void
  on: (event: string, callback: (data: any) => void) => void
  off: (event: string) => void
}

const SocketContext = createContext<SocketContextType | null>(null)

export function SocketProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [player, setPlayer] = useState<Player | null>(null)
  const authToken = (() => {
    try { return localStorage.getItem('token') } catch { return null }
  })()

  useEffect(() => {
    const socketBase = (import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL || 'http://localhost:3001')
      .toString()
      .replace(/\/$/, '')
      .replace(/\/api$/, '')
    const newSocket = io(socketBase, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 15000,
      auth: authToken ? { token: authToken } : undefined,
    })

    newSocket.on('connect', async () => {
      console.log('Connected to server')
      setIsConnected(true)

      // Best-effort: auto-join the user's current session room so orchestration events are received
      try {
        let sessionId: string | null = null
        try {
          const cached = sessionStorage.getItem('currentSession')
          if (cached) {
            const parsed = JSON.parse(cached)
            sessionId = parsed?.session?.id || null
          }
        } catch {}

        if (!sessionId && authToken) {
          const apiBase = (import.meta.env.VITE_API_URL || 'http://localhost:3001/api')
            .toString()
            .replace(/\/$/, '')
          try {
            const resp = await fetch(`${apiBase}/auth/session/current`, {
              headers: { Authorization: `Bearer ${authToken}` },
            })
            if (resp.ok) {
              const data = await resp.json()
              sessionId = data?.session?.id || null
              try { sessionStorage.setItem('currentSession', JSON.stringify({ session: data.session })) } catch {}
            }
          } catch {}
        }

        if (sessionId) {
          newSocket.emit('user:join-session-room', { sessionId })
        }
      } catch {}
    })

    newSocket.on('disconnect', (reason) => {
      console.log('Disconnected from server')
      setIsConnected(false)
      // Attempt quick reconnect on transport close/network issues
      if (['transport close', 'ping timeout', 'io server disconnect'].includes(String(reason))) {
        try { newSocket.connect() } catch {}
      }
    })

    newSocket.on('connect_error', (err: any) => {
      console.warn('Socket connect_error:', err?.message || err)
    })

    newSocket.on('game:state', (state: GameState) => {
      console.log('Game state updated:', state)
      setGameState(state)
    })

    newSocket.on('player:update', (updatedPlayer: Player) => {
      console.log('Player updated:', updatedPlayer)
      setPlayer(updatedPlayer)
    })

    newSocket.on('event:new', (event: GameEvent) => {
      console.log('New game event:', event)
      // You could add a toast notification here
    })

    newSocket.on('notification', (notification: Notification) => {
      console.log('Notification received:', notification)
      // You could add a toast notification here
    })

    // Global admin announcements
    newSocket.on('announcement', (payload: { message: string; type: string }) => {
      try {
        const map: Record<string, (msg: string) => void> = {
          info: (m) => toast(m),
          success: (m) => toast.success(m),
          warning: (m) => toast(m, { icon: '⚠️' }),
          error: (m) => toast.error(m),
        }
        const fn = map[payload.type] || map.info
        fn(payload.message)
      } catch {}
    })

    setSocket(newSocket)

    return () => {
      try { newSocket.close() } catch {}
    }
  }, [authToken])

  const joinGame = (playerId: string) => {
    if (socket) {
      const user = localStorage.getItem('user')
      // Prefer session id from current session API cache if present
      let sessionId = (JSON.parse(user || '{}') as any)?.sessionId || ''
      try {
        const cached = sessionStorage.getItem('currentSession')
        if (cached) {
          const parsed = JSON.parse(cached)
          if (parsed?.session?.id) sessionId = parsed.session.id
        }
      } catch {}
      const playerName = (JSON.parse(user || '{}') as any)?.name || 'Player'
      socket.emit('player:connect', { playerId, playerName, sessionId })
    }
  }

  const updatePlayer = (playerData: Partial<Player>) => {
    if (socket) {
      socket.emit('player:update', playerData)
    }
  }

  const performCompanyAction = (action: CompanyAction) => {
    if (socket) {
      socket.emit('company:action', action)
    }
  }

  const requestGameData = (request: GameRequest) => {
    if (socket) {
      socket.emit('game:request', request)
    }
  }

  const value: SocketContextType = {
    socket,
    isConnected,
    gameState,
    player,
    joinGame,
    updatePlayer,
    performCompanyAction,
    requestGameData,
    emit: (event: string, data?: any) => {
      if (socket) {
        socket.emit(event, data);
      }
    },
    on: (event: string, callback: (data: any) => void) => {
      if (socket) {
        socket.on(event, callback);
      }
    },
    off: (event: string) => {
      if (socket) {
        socket.off(event);
      }
    },
  }

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  )
}

export function useSocket() {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider')
  }
  return context
} 

