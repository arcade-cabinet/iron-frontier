export { usePathname } from './router';

export function useSearchParams() {
  return new URLSearchParams(window.location.search);
}

export function useParams(): Record<string, string> {
  return {};
}
