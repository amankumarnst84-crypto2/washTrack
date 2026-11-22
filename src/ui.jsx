import { useEffect, useRef, useState } from "react";
import { statusName } from "./data";

export function Icon({ name, size = 20, ...props }) {
  const paths = {
    home: "m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z",
    plus: "M12 5v14M5 12h14",
    minus: "M5 12h14",
    arrow: "M4 12h16m-6-6 6 6-6 6",
    back: "M20 12H4m6-6-6 6 6 6",
    history: "M3 11a9 9 0 1 1 2 7M3 4v7h7m2-5v6l4 2",
    clock: "M12 8v5l4 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0",
    check: "m5 12 4 4L19 6",
    lock: "M7 10V7a5 5 0 0 1 10 0v3M5 10h14v11H5Z",
    eye: "M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12m13 0a3 3 0 1 1-6 0 3 3 0 0 1 6 0",
    search: "m16 16 5 5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0",
    info: "M12 11v6m0-10v1M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0",
    chevron: "m9 5 7 7-7 7",
    bag: "M5 7h14l2 14H3ZM8 8V6a4 4 0 0 1 8 0v2",
    close: "m6 6 12 12M6 18 18 6",
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d={paths[name] || paths.info} />
    </svg>
  );
}
export function Brand({ staff = false }) {
  return staff ? (
    <span className="staff-brand">
      <Icon
        name="bag"
        size={28}
      />
      WashTrack
    </span>
  ) : (
    <img
      className="brand"
      src="/washtrack-logo.png"
      alt="WashTrack"
    />
  );
}
export function Badge({ status }) {
  return (
    <span className={`badge status-${status}`}>
      <i />
      {statusName[status] || status.replaceAll("_", " ").toLowerCase()}
    </span>
  );
}
export function Notice({ error, message, retry }) {
  return (
    <>
      {error && (
        <div
          className="notice error"
          role="alert"
        >
          {error}
          {retry && <button onClick={retry}>Retry</button>}
        </div>
      )}
      {message && (
        <div
          className="notice success"
          role="status"
        >
          {message}
        </div>
      )}
    </>
  );
}
export function Password({
  label = "Password",
  name = "password",
  creating = false,
}) {
  const [visible, setVisible] = useState(false);
  return (
    <label className="field">
      {label}
      <span className="password-input">
        <input
          name={name}
          type={visible ? "text" : "password"}
          placeholder={
            creating ? "At least 8 characters" : "Enter your password"
          }
          autoComplete={creating ? "new-password" : "current-password"}
          required
          minLength={creating ? 8 : 1}
          maxLength={72}
        />
        <button
          type="button"
          aria-label={`${visible ? "Hide" : "Show"} ${label.toLowerCase()}`}
          aria-pressed={visible}
          onClick={() => setVisible(!visible)}
        >
          <Icon name="eye" />
        </button>
      </span>
    </label>
  );
}
export function Modal({ title, children, onClose }) {
  const dialog = useRef(null);
  useEffect(() => {
    const before = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog.current?.querySelector("button")?.focus();
    return () => {
      document.body.style.overflow = overflow;
      before?.focus();
    };
  }, []);
  useEffect(() => {
    const close = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [onClose]);
  function keyDown(e) {
    if (e.key !== "Tab") {
      return;
    }
    const elements = [
      ...dialog.current.querySelectorAll(
        "button:not(:disabled), input:not(:disabled), textarea, select, [href]",
      ),
    ];
    const first = elements[0],
      last = elements.at(-1);
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last?.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first?.focus();
    }
  }
  return (
    <div
      className="modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        ref={dialog}
        onKeyDown={keyDown}
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="modal-heading">
          <h2>{title}</h2>
          <button
            autoFocus
            className="icon-button"
            aria-label="Close dialog"
            onClick={onClose}
          >
            <Icon name="close" />
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}
