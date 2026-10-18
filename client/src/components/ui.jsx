// Small shared UI pieces.
import { STATUS_LABEL } from "../format.js";

export const StatusBadge = ({ status }) => <span className={`badge ${status}`}>{STATUS_LABEL[status]}</span>;

export const ErrorBox = ({ children }) => (children ? <div className="error-box">{children}</div> : null);

export const Loading = () => <div className="loading"><div className="spinner" /></div>;

export function Empty({ icon, title, text, action }) {
  return (
    <div className="empty">
      <div className="empty-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{text}</p>
      {action}
    </div>
  );
}

export function Modal({ title, onClose, children }) {
  return (
    <div className="modal-wrap" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-label={title}>
        <div className="modal-head"><h2>{title}</h2><button className="x" onClick={onClose} aria-label="Close">×</button></div>
        {children}
      </div>
    </div>
  );
}
