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

  useEffect(() => {
    const token = localStorage.getItem('token')
    const newSocket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001', {
      transports: ['websocket'],
      auth: token ? { token } : undefined,
    })

    newSocket.on('connect', () => {
      console.log('Connected to server')
      setIsConnected(true)
    })

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server')
      setIsConnected(false)
    })

    newSocket.on('game:update', (state: GameState) => {
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
      newSocket.close()
    }
  }, [])

  const joinGame = (playerId: string) => {
    if (socket) {
      socket.emit('player:join', playerId)
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

