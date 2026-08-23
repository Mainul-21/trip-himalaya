import { cn } from "@/lib/utils";
import {
  claimStaleAssetReload,
  clearStaleAssetReload,
  isStaleAssetError,
} from "@/lib/staleAssetRecovery";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    if (typeof window === "undefined" || !isStaleAssetError(error)) return;

    if (claimStaleAssetReload(window.sessionStorage, window.location.pathname)) {
      window.location.reload();
    }
  }

  private retryLatestVersion = () => {
    if (typeof window === "undefined") return;

    clearStaleAssetReload(window.sessionStorage, window.location.pathname);
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const needsLatestAssets = isStaleAssetError(this.state.error);

      return (
        <div className="flex items-center justify-center min-h-screen p-8 bg-background">
          <div className="flex flex-col items-center w-full max-w-2xl p-8">
            <AlertTriangle
              size={48}
              className="text-destructive mb-6 flex-shrink-0"
            />

            <h2 className="text-xl mb-3 text-center">
              {needsLatestAssets
                ? "A recent website update needs one refresh."
                : "An unexpected error occurred."}
            </h2>

            {needsLatestAssets && (
              <p className="max-w-md mb-6 text-center text-sm leading-6 text-muted-foreground">
                We could not load part of the latest Trip Himalaya website. Please try the newest version once more.
              </p>
            )}

            {!needsLatestAssets && <div className="p-4 w-full rounded bg-muted overflow-auto mb-6">
              <pre className="text-sm text-muted-foreground whitespace-break-spaces">
                {this.state.error?.stack}
              </pre>
            </div>}

            <button
              onClick={needsLatestAssets ? this.retryLatestVersion : () => window.location.reload()}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg",
                "bg-primary text-primary-foreground",
                "hover:opacity-90 cursor-pointer"
              )}
            >
              <RotateCcw size={16} />
              {needsLatestAssets ? "Try latest version" : "Reload Page"}
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
