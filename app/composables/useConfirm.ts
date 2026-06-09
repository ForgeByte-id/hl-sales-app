export interface ConfirmOptions {
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "default" | "danger";
}

interface ConfirmState extends Required<ConfirmOptions> {
  open: boolean;
}

let activeResolver: ((confirmed: boolean) => void) | null = null;

function defaultState(): ConfirmState {
  return {
    open: false,
    title: "",
    description: "",
    confirmLabel: "Ya",
    cancelLabel: "Batal",
    tone: "default",
  };
}

export function useConfirm() {
  const state = useState<ConfirmState>("hl-confirm", defaultState);

  function confirm(options: ConfirmOptions) {
    if (activeResolver) activeResolver(false);

    state.value = {
      open: true,
      title: options.title,
      description: options.description,
      confirmLabel: options.confirmLabel ?? "Ya",
      cancelLabel: options.cancelLabel ?? "Batal",
      tone: options.tone ?? "default",
    };

    return new Promise<boolean>((resolve) => {
      activeResolver = resolve;
    });
  }

  function resolve(confirmed: boolean) {
    state.value = defaultState();
    activeResolver?.(confirmed);
    activeResolver = null;
  }

  return { state, confirm, resolve };
}
