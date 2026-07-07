import { createBrowserRouter } from "react-router";
import Root from "./pages/Root";
import Landing from "./pages/Landing";
import Home from "./pages/Home";
import Library from "./pages/Library";
import Search from "./pages/Search";
import Playlists from "./pages/Playlists";
import PlaylistDetail from "./pages/PlaylistDetail";
import Albums from "./pages/Albums";
import AlbumDetail from "./pages/AlbumDetail";
import Artists from "./pages/Artists";
import ArtistProfile from "./pages/ArtistProfile";
import Bands from "./pages/Bands";
import BandProfile from "./pages/BandProfile";
import Videos from "./pages/Videos";
import VideoDetail from "./pages/VideoDetail";
import NowPlaying from "./pages/NowPlaying";
import Songs from "./pages/Songs";
import Downloads from "./pages/Downloads";
import Favorites from "./pages/Favorites";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Settings from "./pages/Settings";
import Poems from "./pages/Poems";
import Poets from "./pages/Poets";
import PoetProfile from "./pages/PoetProfile";
import PoemDetail from "./pages/PoemDetail";
import News from "./pages/News";
import NewsDetail from "./pages/NewsDetail";
import Occasions from "./pages/Occasions";
import OccasionDetail from "./pages/OccasionDetail";
import ArtistDashboard from "./pages/artist/ArtistDashboard";
import ArtistUpload from "./pages/artist/ArtistUpload";
import ArtistAnalytics from "./pages/artist/ArtistAnalytics";

// Admin
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminArtists from "./pages/admin/AdminArtists";
import AdminReports from "./pages/admin/AdminReports";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminSongs from "./pages/admin/AdminSongs";
import AdminPoets from "./pages/admin/AdminPoets";
import AdminBands from "./pages/admin/AdminBands";
import AdminAlbums from "./pages/admin/AdminAlbums";
import AdminPlaylists from "./pages/admin/AdminPlaylists";
import AdminOccasions from "./pages/admin/AdminOccasions";
import AdminVideos from "./pages/admin/AdminVideos";
import AdminContent from "./pages/admin/AdminContent";
import AdminNews from "./pages/admin/AdminNews";
import NotFound from "./pages/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Landing },
      { path: "home", Component: Home },
      { path: "library", Component: Library },
      { path: "search", Component: Search },

      // Poetry
      { path: "poems", Component: Poems },
      { path: "poem/:id", Component: PoemDetail },
      { path: "poets", Component: Poets },
      { path: "poet/:id", Component: PoetProfile },

      // Artists & Bands
      { path: "artists", Component: Artists },
      { path: "artists/:id", Component: ArtistProfile },
      { path: "bands", Component: Bands },
      { path: "bands/:id", Component: BandProfile },

      // Music
      { path: "playlists", Component: Playlists },
      { path: "playlists/:id", Component: PlaylistDetail },
      { path: "albums", Component: Albums },
      { path: "albums/:id", Component: AlbumDetail },
      { path: "videos", Component: Videos },
      { path: "videos/:id", Component: VideoDetail },
      { path: "songs", Component: Songs },
      { path: "now-playing", Component: NowPlaying },

      // Union
      { path: "news", Component: News },
      { path: "news/:id", Component: NewsDetail },
      { path: "occasions", Component: Occasions },
      { path: "occasions/:id", Component: OccasionDetail },

      // User
      { path: "favorites", Component: Favorites },
      { path: "downloads", Component: Downloads },
      { path: "profile", Component: Profile },
      { path: "login", Component: Login },
      { path: "register", Component: Register },
      { path: "settings", Component: Settings },

      // Artist Dashboard Routes
      {
        path: "artist",
        children: [
          { path: "dashboard", Component: ArtistDashboard },
          { path: "upload", Component: ArtistUpload },
          { path: "analytics", Component: ArtistAnalytics },
        ],
      },

      // Admin Routes — use AdminLayout as their own layout
      {
        path: "admin",
        Component: AdminLayout,
        children: [
          { index: true, Component: AdminDashboard },
          { path: "dashboard", Component: AdminDashboard },
          { path: "users", Component: AdminUsers },
          { path: "artists", Component: AdminArtists },
          { path: "songs", Component: AdminSongs },
          { path: "poets", Component: AdminPoets },
          { path: "bands", Component: AdminBands },
          { path: "albums", Component: AdminAlbums },
          { path: "playlists", Component: AdminPlaylists },
          { path: "occasions", Component: AdminOccasions },
          { path: "videos", Component: AdminVideos },
          { path: "content", Component: AdminContent },
          { path: "reports", Component: AdminReports },
          { path: "settings", Component: AdminSettings },
          { path: "news", Component: AdminNews },
        ],
      },

      { path: "*", Component: NotFound },
    ],
  },
]);
