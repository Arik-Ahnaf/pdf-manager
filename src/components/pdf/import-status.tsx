import { LoaderCircle } from "lucide-react";

export function ImportStatus({
  loading,
  error,
}: {
  loading: boolean;
  error: string | null;
}) {
  return (
    <>
      {loading && (
        <p className="processing-notice" role="status">
          <LoaderCircle size={16} className="animate-spin" />
          Reading PDFs on your device…
        </p>
      )}
      {error && (
        <p className="field-error import-error" role="alert">
          {error}
        </p>
      )}
    </>
  );
}
