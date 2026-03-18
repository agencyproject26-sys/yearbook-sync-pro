import { MainLayout } from "@/components/layout/MainLayout";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase } from "lucide-react";

export default function Case() {
  return (
    <MainLayout>
      <Header
        title="Case"
        subtitle="Kelola semua case pelanggan"
        showSearch={false}
      />
      <main className="flex-1 overflow-y-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Daftar Case
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Briefcase className="h-12 w-12 mb-4 opacity-30" />
              <p className="text-lg font-medium">Belum ada case</p>
              <p className="text-sm">Fitur case akan segera tersedia.</p>
            </div>
          </CardContent>
        </Card>
      </main>
    </MainLayout>
  );
}
