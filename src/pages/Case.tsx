import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Eye, Pencil, Trash2, AlertCircle } from "lucide-react";
import { useCases } from "@/hooks/useCases";
import { useCustomers } from "@/hooks/useCustomers";
import { useOrders } from "@/hooks/useOrders";
import { format } from "date-fns";
import { id } from "date-fns/locale";

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  open: { label: "Open", variant: "destructive" },
  in_progress: { label: "In Progress", variant: "default" },
  resolved: { label: "Resolved", variant: "secondary" },
  closed: { label: "Closed", variant: "outline" },
};

const priorityConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  low: { label: "Low", variant: "outline" },
  medium: { label: "Medium", variant: "secondary" },
  high: { label: "High", variant: "default" },
  urgent: { label: "Urgent", variant: "destructive" },
};

export default function Case() {
  const { cases, isLoading, createCase, updateCase, deleteCase, generateCaseNumber } = useCases();
  const { customers } = useCustomers();
  const { orders } = useOrders();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Form state
  const [form, setForm] = useState({
    title: "",
    description: "",
    customer_id: "",
    order_id: "",
    priority: "medium",
    assigned_to: "",
  });

  const resetForm = () => setForm({ title: "", description: "", customer_id: "", order_id: "", priority: "medium", assigned_to: "" });

  const filteredCases = cases.filter((c) => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) || c.case_number.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || c.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleCreate = () => {
    createCase.mutate({
      case_number: generateCaseNumber(),
      title: form.title,
      description: form.description || undefined,
      customer_id: form.customer_id || undefined,
      order_id: form.order_id || undefined,
      priority: form.priority,
      assigned_to: form.assigned_to || undefined,
    });
    setDialogOpen(false);
    resetForm();
  };

  const handleUpdate = () => {
    if (!selectedCase) return;
    updateCase.mutate({
      id: selectedCase.id,
      title: form.title,
      description: form.description || null,
      customer_id: form.customer_id || null,
      order_id: form.order_id || null,
      priority: form.priority,
      assigned_to: form.assigned_to || null,
    });
    setIsEditing(false);
    setDetailOpen(false);
    resetForm();
  };

  const handleStatusChange = (caseId: string, newStatus: string) => {
    updateCase.mutate({
      id: caseId,
      status: newStatus,
      ...(newStatus === "closed" ? { closed_at: new Date().toISOString() } : {}),
    });
  };

  const openDetail = (c: any) => {
    setSelectedCase(c);
    setForm({
      title: c.title,
      description: c.description || "",
      customer_id: c.customer_id || "",
      order_id: c.order_id || "",
      priority: c.priority,
      assigned_to: c.assigned_to || "",
    });
    setIsEditing(false);
    setDetailOpen(true);
  };

  const CaseForm = ({ onSubmit, submitLabel }: { onSubmit: () => void; submitLabel: string }) => (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium text-foreground">Judul *</label>
        <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Judul case" />
      </div>
      <div>
        <label className="text-sm font-medium text-foreground">Deskripsi</label>
        <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Deskripsi masalah" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-foreground">Pelanggan</label>
          <Select value={form.customer_id} onValueChange={(v) => setForm({ ...form, customer_id: v })}>
            <SelectTrigger><SelectValue placeholder="Pilih pelanggan" /></SelectTrigger>
            <SelectContent>
              {customers.map((c) => (<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium text-foreground">Order</label>
          <Select value={form.order_id} onValueChange={(v) => setForm({ ...form, order_id: v })}>
            <SelectTrigger><SelectValue placeholder="Pilih order" /></SelectTrigger>
            <SelectContent>
              {orders.map((o) => (<SelectItem key={o.id} value={o.id}>{o.order_number}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-foreground">Prioritas</label>
          <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="text-sm font-medium text-foreground">Ditugaskan ke</label>
          <Input value={form.assigned_to} onChange={(e) => setForm({ ...form, assigned_to: e.target.value })} placeholder="Nama penanggung jawab" />
        </div>
      </div>
      <Button onClick={onSubmit} disabled={!form.title} className="w-full">{submitLabel}</Button>
    </div>
  );

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Case / Tiket Support</h1>
            <p className="text-muted-foreground">Kelola tiket dan keluhan pelanggan</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}><Plus className="mr-2 h-4 w-4" />Buat Case</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>Buat Case Baru</DialogTitle></DialogHeader>
              <CaseForm onSubmit={handleCreate} submitLabel="Simpan" />
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Open", count: cases.filter((c) => c.status === "open").length, color: "text-destructive" },
            { label: "In Progress", count: cases.filter((c) => c.status === "in_progress").length, color: "text-primary" },
            { label: "Resolved", count: cases.filter((c) => c.status === "resolved").length, color: "text-muted-foreground" },
            { label: "Total", count: cases.length, color: "text-foreground" },
          ].map((s) => (
            <Card key={s.label}>
              <CardContent className="p-4 text-center">
                <p className={`text-2xl font-bold ${s.color}`}>{s.count}</p>
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Cari case..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No. Case</TableHead>
                  <TableHead>Judul</TableHead>
                  <TableHead>Pelanggan</TableHead>
                  <TableHead>Prioritas</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Memuat...</TableCell></TableRow>
                ) : filteredCases.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <AlertCircle className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">Belum ada case</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCases.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-mono text-sm">{c.case_number}</TableCell>
                      <TableCell className="font-medium">{c.title}</TableCell>
                      <TableCell>{c.customers?.name || "-"}</TableCell>
                      <TableCell>
                        <Badge variant={priorityConfig[c.priority]?.variant || "outline"}>
                          {priorityConfig[c.priority]?.label || c.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusConfig[c.status]?.variant || "outline"}>
                          {statusConfig[c.status]?.label || c.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{format(new Date(c.created_at), "dd MMM yyyy", { locale: id })}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button size="icon" variant="ghost" onClick={() => openDetail(c)}><Eye className="h-4 w-4" /></Button>
                          <Button size="icon" variant="ghost" onClick={() => deleteCase.mutate(c.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Detail Dialog */}
        <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span>{selectedCase?.case_number}</span>
                <Button size="sm" variant="outline" onClick={() => setIsEditing(!isEditing)}>
                  <Pencil className="mr-1 h-3 w-3" />{isEditing ? "Batal" : "Edit"}
                </Button>
              </DialogTitle>
            </DialogHeader>
            {isEditing ? (
              <CaseForm onSubmit={handleUpdate} submitLabel="Perbarui" />
            ) : selectedCase ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Judul</p>
                  <p className="font-medium">{selectedCase.title}</p>
                </div>
                {selectedCase.description && (
                  <div>
                    <p className="text-sm text-muted-foreground">Deskripsi</p>
                    <p>{selectedCase.description}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Pelanggan</p>
                    <p>{selectedCase.customers?.name || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Order</p>
                    <p>{selectedCase.orders?.order_number || "-"}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Prioritas</p>
                    <Badge variant={priorityConfig[selectedCase.priority]?.variant}>{priorityConfig[selectedCase.priority]?.label}</Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Ditugaskan ke</p>
                    <p>{selectedCase.assigned_to || "-"}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Ubah Status</p>
                  <Select value={selectedCase.status} onValueChange={(v) => handleStatusChange(selectedCase.id, v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ) : null}
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
