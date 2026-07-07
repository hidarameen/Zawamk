import { useEffect } from 'react';
import { RouterProvider } from 'react-router';
import { router } from './routes';
import { useDataStore } from './store/dataStore';

export default function App() {
  const { fetchData, tracks } = useDataStore();

  useEffect(() => {
    // fetch only if no data yet (cache or previous load will skip inside)
    if (!tracks || tracks.length === 0) {
      fetchData();
    }
  }, []); // once on mount

  return <RouterProvider router={router} />;
}
