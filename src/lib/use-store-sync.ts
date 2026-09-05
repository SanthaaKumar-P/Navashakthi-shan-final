import { useEffect, useState } from "react";
import { ORDERS_UPDATED_EVENT } from "./orders";
import { LISTINGS_UPDATED_EVENT } from "./published-listings";

const EVENTS = [
  ORDERS_UPDATED_EVENT,
  LISTINGS_UPDATED_EVENT,
  "navshakthi:craft-published",
  "storage",
];

/**
 * Client-only subscription to the prototype localStorage stores.
 * `read` runs after mount (never during SSR) and again on every store change.
 */
export function useStoreData<T>(read: () => T, initial: T): T {
  const [data, setData] = useState<T>(initial);

  useEffect(() => {
    const refresh = () => {
      try {
        setData(read());
      } catch (error) {
        console.error("Store read failed:", error);
      }
    };
    refresh();
    EVENTS.forEach((e) => window.addEventListener(e, refresh));
    return () => EVENTS.forEach((e) => window.removeEventListener(e, refresh));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return data;
}
