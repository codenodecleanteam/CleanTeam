import { useLocation } from 'wouter';

export function useRouting() {
  const [location, setLocation] = useLocation();

  return {
    location,
    navigate: (to: string) => {
      setLocation(to);
    },
  };
}

