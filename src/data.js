import { useEffect, useState } from "react";
import { api } from "./api";
export const statusName = {
  SUBMITTED: "Pending",
  RECEIVED: "Received",
  WASHING: "Washing",
  READY: "Ready for pickup",
  COLLECTED: "Collected",
};
export const shortId = (id) => `WT-${id.slice(0, 8).toUpperCase()}`;
export const dateText = (date, time = false) =>
  new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...(time ? { hour: "numeric", minute: "2-digit" } : {}),
    timeZone: "Asia/Kolkata",
  }).format(new Date(date));
export const today = () =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(
    new Date(),
  );
export function usePage(defaultPage) {
  const read = () => window.location.hash.slice(1) || defaultPage;
  const [page, setPage] = useState(read);
  useEffect(() => {
    const changed = () => setPage(read());
    window.addEventListener("hashchange", changed);
    return () => window.removeEventListener("hashchange", changed);
  }, [defaultPage]); // eslint-disable-line react-hooks/exhaustive-deps
  return [
    page,
    (next) => {
      window.location.hash = next;
    },
  ];
}
export function useOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  async function refresh() {
    try {
      const data = await api("/orders");
      setOrders(data.orders);
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    let active = true;
    async function poll() {
      try {
        const data = await api("/orders");
        if (active) {
          setOrders(data.orders);
          setError("");
        }
      } catch (err) {
        if (active) {
          setError(err.message);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }
    poll();
    const timer = setInterval(poll, 10000);
    window.addEventListener("focus", poll);
    return () => {
      active = false;
      clearInterval(timer);
      window.removeEventListener("focus", poll);
    };
  }, []);
  return { orders, loading, error, refresh };
}

export const dateKey = (value) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));
