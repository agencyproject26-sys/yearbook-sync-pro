import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Upload, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function DataMigrationCard() {
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<Record<string, { count: number; status: string; error?: string }> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    setExporting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Anda harus login terlebih dahulu");
        return;
      }

      const res = await supabase.functions.invoke("export-data", {
        method: "POST",
      });

      if (res.error) throw res.error;

      const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `export-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);

      toast.success("Data berhasil diekspor!");
    } catch (err: any) {
      toast.error(err.message || "Gagal mengekspor data");
    } finally {
      setExporting(false);
    }
  };

  const handleImport = async (file: File) => {
    setImporting(true);
    setImportResult(null);
    try {
      const text = await file.text();
      const json = JSON.parse(text);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Anda harus login terlebih dahulu");
        return;
      }

      // Dry run first
      const dryRes = await supabase.functions.invoke("import-data", {
        body: { tables: json.tables, dry_run: true },
      });

      if (dryRes.error) throw dryRes.error;

      const totalRows = Object.values(dryRes.data.results as Record<string, { count: number }>)
        .reduce((sum, r) => sum + r.count, 0);

      if (!confirm(`Import ${totalRows} baris data ke ${Object.keys(dryRes.data.results).filter((k) => (dryRes.data.results as any)[k].count > 0).length} tabel?\n\nLanjutkan?`)) {
        setImporting(false);
        return;
      }

      const res = await supabase.functions.invoke("import-data", {
        body: { tables: json.tables, dry_run: false },
      });

      if (res.error) throw res.error;

      setImportResult(res.data.results);
      toast.success("Data berhasil diimpor!");
    } catch (err: any) {
      toast.error(err.message || "Gagal mengimpor data");
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Migrasi Data</CardTitle>
        <CardDescription>Ekspor atau impor seluruh data database dalam format JSON</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-3">
          <Button onClick={handleExport} disabled={exporting} variant="outline">
            {exporting ? <Loader2 className="animate-spin" /> : <Download />}
            {exporting ? "Mengekspor..." : "Export Data"}
          </Button>

          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={importing}
            variant="outline"
          >
            {importing ? <Loader2 className="animate-spin" /> : <Upload />}
            {importing ? "Mengimpor..." : "Import Data"}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleImport(file);
            }}
          />
        </div>

        {importResult && (
          <div className="rounded-md border p-3 space-y-1 text-sm">
            <p className="font-medium mb-2">Hasil Import:</p>
            {Object.entries(importResult).map(([table, result]) => (
              <div key={table} className="flex items-center gap-2">
                {result.status === "success" ? (
                  <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                ) : result.status === "error" ? (
                  <AlertCircle className="h-3.5 w-3.5 text-destructive" />
                ) : (
                  <span className="h-3.5 w-3.5 text-muted-foreground">—</span>
                )}
                <span className="text-muted-foreground">{table}:</span>
                <span>{result.count} baris ({result.status})</span>
                {result.error && <span className="text-destructive text-xs">({result.error})</span>}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
