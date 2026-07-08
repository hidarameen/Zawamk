export interface Track {
  id: string;
  title: string;
  artistId: string;
  artist?: Artist;
  collaborators?: Artist[];
  artistName: string;
  albumId?: string;
  album?: Album;
  albumName: string;
  coverUrl: string;
  audioUrl?: string;
  duration: number;
  lyrics?: string;
  type?: string;
  views: number;
  likes: number;
  plays?: number;
  releaseYear?: number;
  createdAt?: string;
  poetId?: string;
  poetName?: string;
  occasionId?: string;
  occasionName?: string;
  bandId?: string;
  bandName?: string;
  genre?: string;
}

export interface Artist {
  id: string;
  name: string;
  bio?: string;
  avatar?: string;
  coverImage?: string;
  followers: number;
  verified: boolean;
  monthlyListeners: number;
  bio?: string;
  genres?: string[];
  createdAt?: string;
}

export interface Album {
  id: string;
  title: string;
  artistId: string;
  artist?: Artist;
  artistName: string;
  bandId?: string;
  coverUrl?: string;
  releaseDate?: string;
  totalTracks: number;
  duration: number;
  genre?: string;
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  coverUrl?: string;
  createdBy: string;
  followers: number;
  isPublic: boolean;
  tracks?: Track[];
}

export interface Band {
  id: string;
  name: string;
  bio?: string;
  avatar?: string;
  coverImage?: string;
  membersCount: number;
  foundedYear?: number;
  verified: boolean;
  followers: number;
  style?: string;
}

export interface Poet {
  id: string;
  name: string;
  bio?: string;
  avatar?: string;
  coverImage?: string;
  followers: number;
  verified: boolean;
  monthlyListeners: number;
}

export interface Poem {
  id: string;
  title: string;
  text: string;
  poetId: string;
  poet?: Poet;
  audioUrl?: string;
  videoUrl?: string;
  coverUrl?: string;
  category?: string;
  verses: number;
  views: number;
  likes: number;
  occasionId?: string;
}

export interface NewsItem {
  id: string;
  title: string;
  excerpt?: string;
  content: string;
  coverUrl?: string;
  publishedAt: string;
  category?: string;
  author?: string;
  views: number;
  featured: boolean;
}

export interface Occasion {
  id: string;
  title: string;
  description?: string;
  coverUrl?: string;
  date?: string;
  type?: string;
  color?: string;
}

export interface MusicVideo {
  id: string;
  title: string;
  artistId?: string;
  artistName?: string;
  thumbnailUrl?: string;
  videoUrl: string;
  duration: number;
  views: number;
  releaseDate?: string;
  type?: string;
  createdAt?: string;
}
