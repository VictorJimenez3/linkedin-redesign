/* ============================================================
   TOASTCONTAINER.JS — Renders toast notifications from context
   ============================================================ */
function Toast({ toast }) {
  const [visible, setVisible] = React.useState(false);
  React.useEffect(() => {
    const t = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(t);
  }, []);
  return (
    <div className={`li-toast li-toast--${toast.type || 'success'}${visible ? ' show' : ''}`}>
      {toast.message}
    </div>
  );
}

function ToastContainer() {
  const { toasts } = React.useContext(AppContext);
  if (!toasts.length) return null;
  return (
    <div className="li-toast-container">
      {toasts.map(toast => <Toast key={toast.id} toast={toast} />)}
    </div>
  );
}
