import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useDataStore } from '../store/dataStore';

export type User = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'user' | 'artist' | 'admin';
  isArtist: boolean;
  followedArtists: string[];
  likedSongs: string[];
  playlists: string[];
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  followArtist: (artistId: string) => Promise<void>;
  likeSong: (songId: string) => Promise<void>;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { fetchData, fetchUserPlaylists } = useDataStore(); // To re-trigger data if needed

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchMe(token);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchMe = async (token: string) => {
    try {
      const res = await fetch('https://music.hidar.eu.cc/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
        // Load user specific data (playlists etc)
        fetchUserPlaylists();
      } else {
        localStorage.removeItem('token');
        setUser(null);
      }
    } catch (err) {
      console.error('Failed to fetch user', err);
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const res = await fetch('https://music.hidar.eu.cc/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    
    localStorage.setItem('token', data.token);
    await fetchMe(data.token);
  };

  const register = async (name: string, email: string, password: string) => {
    const res = await fetch('https://music.hidar.eu.cc/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Registration failed');
    
    localStorage.setItem('token', data.token);
    await fetchMe(data.token);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const followArtist = async (artistId: string) => {
    const token = localStorage.getItem('token');
    if (!token || !user) return;
    
    // Optimistic UI update
    const isFollowing = user.followedArtists.includes(artistId);
    setUser(prev => prev ? {
      ...prev,
      followedArtists: isFollowing
        ? prev.followedArtists.filter(id => id !== artistId)
        : [...prev.followedArtists, artistId]
    } : null);

    try {
      const res = await fetch(`https://music.hidar.eu.cc/api/artists/${artistId}/follow`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Follow failed');
    } catch (err) {
      console.error(err);
      // Revert if failed
      setUser(prev => prev ? {
        ...prev,
        followedArtists: isFollowing
          ? [...prev.followedArtists, artistId]
          : prev.followedArtists.filter(id => id !== artistId)
      } : null);
    }
  };

  const likeSong = async (songId: string) => {
    const token = localStorage.getItem('token');
    if (!token || !user) return;
    
    // Optimistic UI update
    const isLiked = user.likedSongs.includes(songId);
    setUser(prev => prev ? {
      ...prev,
      likedSongs: isLiked
        ? prev.likedSongs.filter(id => id !== songId)
        : [...prev.likedSongs, songId]
    } : null);

    try {
      const res = await fetch(`https://music.hidar.eu.cc/api/tracks/${songId}/like`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Like failed');
    } catch (err) {
      console.error(err);
      // Revert if failed
      setUser(prev => prev ? {
        ...prev,
        likedSongs: isLiked
          ? [...prev.likedSongs, songId]
          : prev.likedSongs.filter(id => id !== songId)
      } : null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        followArtist,
        likeSong,
        loading
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
