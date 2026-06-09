export type ToastTone = "success" | "error" | "info";

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  tone: ToastTone;
}

const DEFAULT_TIMEOUT = 4200;

export function useToast() {
  const toasts = useState<ToastMessage[]>("hl-toasts", () => []);

  function removeToast(id: string) {
    toasts.value = toasts.value.filter((toast) => toast.id !== id);
  }

  function pushToast(
    message: Omit<ToastMessage, "id">,
    timeout = DEFAULT_TIMEOUT,
  ) {
    const id = createTempId("toast");
    toasts.value = [...toasts.value, { ...message, id }];

    if (import.meta.client && timeout > 0) {
      window.setTimeout(() => removeToast(id), timeout);
    }

    return id;
  }

  return {
    toasts,
    success: (title: string, description?: string) =>
      pushToast({ title, description, tone: "success" }),
    error: (title: string, description?: string) =>
      pushToast({ title, description, tone: "error" }, 6000),
    info: (title: string, description?: string) =>
      pushToast({ title, description, tone: "info" }),
    removeToast,
  };
}
