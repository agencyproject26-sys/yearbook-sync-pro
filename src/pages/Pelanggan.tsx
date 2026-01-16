import { useState } from "react";
import { Plus, Search, Filter, MoreHorizontal, Phone, MapPin, Building, User, X, Loader2, FileText, ExternalLink } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useCustomers, CustomerFormData, Customer } from "@/hooks/useCustomers";
import { useOrders, OrderFormData } from "@/hooks/useOrders";

const statusConfig = {
  prospek: { label: "Prospek", className: "bg-warning/15 text-warning hover:bg-warning/20" },
  aktif: { label: "Aktif", className: "bg-success/15 text-success hover:bg-success/20" },
  selesai: { label: "Selesai", className: "bg-primary/15 text-primary hover:bg-primary/20" },
};

const emptyFormData: CustomerFormData = {
  name: "",
  pic_name: "",
  phones: [""],
  city: "",
  address: "",
  status: "prospek",
};

const emptyOrderFormData: OrderFormData = {
  customer_id: "",
  value: 0,
  wa_desc: "",
  notes: "",
};

export default function Pelanggan() {
  const { customers, loading, addCustomer, deleteCustomer } = useCustomers();
  const { addOrder } = useOrders();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<CustomerFormData>(emptyFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Order dialog state
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);
  const [orderFormData, setOrderFormData] = useState<OrderFormData>(emptyOrderFormData);
  const [isOrderSubmitting, setIsOrderSubmitting] = useState(false);
  
  // SPH dialog state
  const [isSphDialogOpen, setIsSphDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch = customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.pic_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || customer.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAddPhone = () => {
    setFormData(prev => ({ ...prev, phones: [...prev.phones, ""] }));
  };

  const handlePhoneChange = (index: number, value: string) => {
    const newPhones = [...formData.phones];
    newPhones[index] = value;
    setFormData(prev => ({ ...prev, phones: newPhones }));
  };

  const handleRemovePhone = (index: number) => {
    if (formData.phones.length > 1) {
      const newPhones = formData.phones.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, phones: newPhones }));
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.pic_name || !formData.city) return;
    
    setIsSubmitting(true);
    const success = await addCustomer(formData);
    setIsSubmitting(false);
    
    if (success) {
      setFormData(emptyFormData);
      setIsDialogOpen(false);
    }
  };

  const handleDialogClose = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) setFormData(emptyFormData);
  };

  // Handle Order creation
  const handleCreateOrder = (customer: Customer) => {
    setOrderFormData({ ...emptyOrderFormData, customer_id: customer.id });
    setSelectedCustomer(customer);
    setIsOrderDialogOpen(true);
  };

  const handleOrderSubmit = async () => {
    if (!orderFormData.customer_id || !orderFormData.value) return;
    
    setIsOrderSubmitting(true);
    const success = await addOrder(orderFormData);
    setIsOrderSubmitting(false);
    
    if (success) {
      setOrderFormData(emptyOrderFormData);
      setIsOrderDialogOpen(false);
      setSelectedCustomer(null);
    }
  };

  const handleOrderDialogClose = (open: boolean) => {
    setIsOrderDialogOpen(open);
    if (!open) {
      setOrderFormData(emptyOrderFormData);
      setSelectedCustomer(null);
    }
  };

  // Handle SPH (Surat Penawaran Harga)
  const handleCreateSph = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsSphDialogOpen(true);
  };

  const handleSphDialogClose = (open: boolean) => {
    setIsSphDialogOpen(open);
    if (!open) setSelectedCustomer(null);
  };

  const openCanvaSph = () => {
    // Open Canva SPH template - this would be the template link
    const canvaUrl = `https://www.canva.com/design/new?template=sph`;
    window.open(canvaUrl, "_blank");
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex h-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Header
        title="Pelanggan"
        subtitle="Kelola data pelanggan sekolah"
        showAddButton
        addButtonLabel="Tambah Pelanggan"
        onAddClick={() => setIsDialogOpen(true)}
      />

      <div className="p-6">
        {/* Filters */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 gap-3">
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cari sekolah..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua</SelectItem>
                <SelectItem value="prospek">Prospek</SelectItem>
                <SelectItem value="aktif">Aktif</SelectItem>
                <SelectItem value="selesai">Selesai</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <p className="text-sm text-muted-foreground">
            Menampilkan {filteredCustomers.length} dari {customers.length} pelanggan
          </p>
        </div>

        {/* Customer Cards Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCustomers.map((customer) => {
            const status = statusConfig[customer.status];
            return (
              <div
                key={customer.id}
                className="group rounded-xl border border-border bg-card p-5 transition-all duration-200 hover:border-primary/20 hover:shadow-card"
              >
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                      <Building className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{customer.name}</h3>
                      <Badge className={cn("mt-1", status.className)}>
                        {status.label}
                      </Badge>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Lihat Detail</DropdownMenuItem>
                      <DropdownMenuItem>Edit</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleCreateSph(customer)}>
                        <FileText className="mr-2 h-4 w-4" />
                        Buat SPH
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleCreateOrder(customer)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Buat Order
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-destructive"
                        onClick={() => deleteCustomer(customer.id)}
                      >
                        Hapus
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <User className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
                    <p className="text-sm font-medium text-foreground">{customer.pic_name}</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{customer.city}</p>
                      <p className="text-xs text-muted-foreground">{customer.address}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Phone className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
                    <div className="flex flex-wrap gap-2">
                      {customer.phones?.map((phone, idx) => (
                        <span key={idx} className="text-sm text-foreground">
                          {phone}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex gap-2 border-t border-border pt-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleCreateSph(customer)}
                  >
                    <FileText className="mr-1 h-3 w-3" />
                    Buat SPH
                  </Button>
                  <Button 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleCreateOrder(customer)}
                  >
                    <Plus className="mr-1 h-3 w-3" />
                    Buat Order
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {filteredCustomers.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Building className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium">Belum ada pelanggan</h3>
            <p className="text-sm text-muted-foreground">Klik tombol "Tambah Pelanggan" untuk menambahkan pelanggan baru.</p>
          </div>
        )}

        {/* Add Customer Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Tambah Pelanggan Baru</DialogTitle>
              <DialogDescription>
                Masukkan informasi sekolah baru sebagai pelanggan.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nama Sekolah *</Label>
                <Input 
                  id="name" 
                  placeholder="Contoh: SMA Negeri 1 Jakarta" 
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="pic_name">Nama PIC *</Label>
                <Input 
                  id="pic_name" 
                  placeholder="Contoh: Bpk. Ahmad / Ibu Sari" 
                  value={formData.pic_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, pic_name: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label>Nomor Telepon PIC</Label>
                {formData.phones.map((phone, index) => (
                  <div key={index} className="flex gap-2">
                    <Input 
                      placeholder="08xxxxxxxxxx" 
                      value={phone}
                      onChange={(e) => handlePhoneChange(index, e.target.value)}
                    />
                    {formData.phones.length > 1 && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleRemovePhone(index)}
                        className="shrink-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button variant="ghost" size="sm" className="w-fit" onClick={handleAddPhone}>
                  <Plus className="mr-1 h-3 w-3" />
                  Tambah Nomor
                </Button>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="city">Kota *</Label>
                <Input 
                  id="city" 
                  placeholder="Contoh: Jakarta Selatan" 
                  value={formData.city}
                  onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="address">Alamat Lengkap</Label>
                <Textarea 
                  id="address" 
                  placeholder="Masukkan alamat lengkap sekolah" 
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value: "prospek" | "aktif" | "selesai") => 
                    setFormData(prev => ({ ...prev, status: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="prospek">Prospek</SelectItem>
                    <SelectItem value="aktif">Aktif</SelectItem>
                    <SelectItem value="selesai">Selesai</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => handleDialogClose(false)}>
                Batal
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={!formData.name || !formData.pic_name || !formData.city || isSubmitting}
              >
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Plus className="mr-2 h-4 w-4" />
                Simpan Pelanggan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Create Order Dialog */}
        <Dialog open={isOrderDialogOpen} onOpenChange={handleOrderDialogClose}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Buat Order Baru</DialogTitle>
              <DialogDescription>
                Buat order untuk {selectedCustomer?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="rounded-lg border border-border bg-muted/50 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Building className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{selectedCustomer?.name}</p>
                    <p className="text-sm text-muted-foreground">{selectedCustomer?.city}</p>
                  </div>
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="orderValue">Nilai Order (Rp) *</Label>
                <Input 
                  id="orderValue" 
                  type="number" 
                  placeholder="Contoh: 45000000" 
                  value={orderFormData.value || ""}
                  onChange={(e) => setOrderFormData(prev => ({ ...prev, value: parseFloat(e.target.value) || 0 }))}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="waDesc">Deskripsi Grup WhatsApp</Label>
                <Textarea
                  id="waDesc"
                  placeholder="Masukkan deskripsi untuk grup WhatsApp"
                  rows={2}
                  value={orderFormData.wa_desc}
                  onChange={(e) => setOrderFormData(prev => ({ ...prev, wa_desc: e.target.value }))}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="orderNotes">Catatan Internal</Label>
                <Textarea
                  id="orderNotes"
                  placeholder="Catatan tambahan untuk order ini"
                  rows={2}
                  value={orderFormData.notes}
                  onChange={(e) => setOrderFormData(prev => ({ ...prev, notes: e.target.value }))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => handleOrderDialogClose(false)}>
                Batal
              </Button>
              <Button 
                onClick={handleOrderSubmit} 
                disabled={!orderFormData.value || isOrderSubmitting}
              >
                {isOrderSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Plus className="mr-2 h-4 w-4" />
                Buat Order
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* SPH Dialog */}
        <Dialog open={isSphDialogOpen} onOpenChange={handleSphDialogClose}>
          <DialogContent className="sm:max-w-[450px]">
            <DialogHeader>
              <DialogTitle>Buat SPH (Surat Penawaran Harga)</DialogTitle>
              <DialogDescription>
                Generate SPH untuk {selectedCustomer?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="rounded-lg border border-border bg-muted/50 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Building className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{selectedCustomer?.name}</p>
                    <p className="text-sm text-muted-foreground">PIC: {selectedCustomer?.pic_name}</p>
                    <p className="text-sm text-muted-foreground">{selectedCustomer?.city}</p>
                  </div>
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground">
                Klik tombol di bawah untuk membuka template SPH di Canva. Data pelanggan akan digunakan untuk mengisi template.
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => handleSphDialogClose(false)}>
                Batal
              </Button>
              <Button onClick={openCanvaSph}>
                <ExternalLink className="mr-2 h-4 w-4" />
                Buka Template Canva
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
