import { createBrowserRouter } from "react-router";
import Root from "./pages/Root";

// Admin
import AdminLayout from "./pages/admin/AdminLayout";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, lazy: async () => ({ Component: (await import("./pages/Landing")).default }) },
      { path: "home", lazy: async () => ({ Component: (await import("./pages/Home")).default }) },
      { path: "library", lazy: async () => ({ Component: (await import("./pages/Library")).default }) },
      { path: "search", lazy: async () => ({ Component: (await import("./pages/Search")).default }) },

      // Poetry
      { path: "poems", lazy: async () => ({ Component: (await import("./pages/Poems")).default }) },
      { path: "poem/:id", lazy: async () => ({ Component: (await import("./pages/PoemDetail")).default }) },
      { path: "poets", lazy: async () => ({ Component: (await import("./pages/Poets")).default }) },
      { path: "poet/:id", lazy: async () => ({ Component: (await import("./pages/PoetProfile")).default }) },

      // Artists & Bands
      { path: "artists", lazy: async () => ({ Component: (await import("./pages/Artists")).default }) },
      { path: "artists/:id", lazy: async () => ({ Component: (await import("./pages/ArtistProfile")).default }) },
      { path: "bands", lazy: async () => ({ Component: (await import("./pages/Bands")).default }) },
      { path: "bands/:id", lazy: async () => ({ Component: (await import("./pages/BandProfile")).default }) },

      // Music
      { path: "playlists", lazy: async () => ({ Component: (await import("./pages/Playlists")).default }) },
      { path: "playlists/:id", lazy: async () => ({ Component: (await import("./pages/PlaylistDetail")).default }) },
      { path: "albums", lazy: async () => ({ Component: (await import("./pages/Albums")).default }) },
      { path: "albums/:id", lazy: async () => ({ Component: (await import("./pages/AlbumDetail")).default }) },
      { path: "videos", lazy: async () => ({ Component: (await import("./pages/Videos")).default }) },
      { path: "videos/:id", lazy: async () => ({ Component: (await import("./pages/VideoDetail")).default }) },
      { path: "songs", lazy: async () => ({ Component: (await import("./pages/Songs")).default }) },
      { path: "now-playing", lazy: async () => ({ Component: (await import("./pages/NowPlaying")).default }) },

      // Union
      { path: "news", lazy: async () => ({ Component: (await import("./pages/News")).default }) },
      { path: "news/:id", lazy: async () => ({ Component: (await import("./pages/NewsDetail")).default }) },
      { path: "occasions", lazy: async () => ({ Component: (await import("./pages/Occasions")).default }) },
      { path: "occasions/:id", lazy: async () => ({ Component: (await import("./pages/OccasionDetail")).default }) },

      // User
      { path: "favorites", lazy: async () => ({ Component: (await import("./pages/Favorites")).default }) },
      { path: "downloads", lazy: async () => ({ Component: (await import("./pages/Downloads")).default }) },
      { path: "profile", lazy: async () => ({ Component: (await import("./pages/Profile")).default }) },
      { path: "login", lazy: async () => ({ Component: (await import("./pages/Login")).default }) },
      { path: "register", lazy: async () => ({ Component: (await import("./pages/Register")).default }) },
      { path: "settings", lazy: async () => ({ Component: (await import("./pages/Settings")).default }) },

      // Artist Dashboard Routes
      {
        path: "artist",
        children: [
          { path: "dashboard", lazy: async () => ({ Component: (await import("./pages/artist/ArtistDashboard")).default }) },
          { path: "upload", lazy: async () => ({ Component: (await import("./pages/artist/ArtistUpload")).default }) },
          { path: "analytics", lazy: async () => ({ Component: (await import("./pages/artist/ArtistAnalytics")).default }) },
        ],
      },

      // Admin Routes — use AdminLayout as their own layout
      {
        path: "admin",
        Component: AdminLayout,
        children: [
          { index: true, lazy: async () => ({ Component: (await import("./pages/admin/AdminDashboard")).default }) },
          { path: "dashboard", lazy: async () => ({ Component: (await import("./pages/admin/AdminDashboard")).default }) },
          { path: "users", lazy: async () => ({ Component: (await import("./pages/admin/AdminUsers")).default }) },
          { path: "artists", lazy: async () => ({ Component: (await import("./pages/admin/AdminArtists")).default }) },
          { path: "songs", lazy: async () => ({ Component: (await import("./pages/admin/AdminSongs")).default }) },
          { path: "poets", lazy: async () => ({ Component: (await import("./pages/admin/AdminPoets")).default }) },
          { path: "bands", lazy: async () => ({ Component: (await import("./pages/admin/AdminBands")).default }) },
          { path: "albums", lazy: async () => ({ Component: (await import("./pages/admin/AdminAlbums")).default }) },
          { path: "playlists", lazy: async () => ({ Component: (await import("./pages/admin/AdminPlaylists")).default }) },
          { path: "occasions", lazy: async () => ({ Component: (await import("./pages/admin/AdminOccasions")).default }) },
          { path: "videos", lazy: async () => ({ Component: (await import("./pages/admin/AdminVideos")).default }) },
          { path: "content", lazy: async () => ({ Component: (await import("./pages/admin/AdminContent")).default }) },
          { path: "reports", lazy: async () => ({ Component: (await import("./pages/admin/AdminReports")).default }) },
          { path: "settings", lazy: async () => ({ Component: (await import("./pages/admin/AdminSettings")).default }) },
          { path: "news", lazy: async () => ({ Component: (await import("./pages/admin/AdminNews")).default }) },
        ],
      },

      { path: "*", lazy: async () => ({ Component: (await import("./pages/NotFound")).default }) },
    ],
  },
]);
