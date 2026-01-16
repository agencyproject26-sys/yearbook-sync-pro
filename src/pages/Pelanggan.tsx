import { useState } from "react";
import { Plus, Search, Filter, MoreHorizontal, Phone, MapPin, Building, User, X } from "lucide-react";
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
  DialogTrigger,
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

interface Customer {
  id: string;
  name: string;
  picName: string;
  phones: string[];
  city: string;
  address: string;
  status: "prospek" | "aktif" | "selesai";
  createdAt: string;
}

interface CustomerFormData {
  name: string;
  picName: string;
  phones: string[];
  city: string;
  address: string;
  status: "prospek" | "aktif" | "selesai";
}

const statusConfig = {
  prospek: { label: "Prospek", className: "bg-warning/15 text-warning hover:bg-warning/20" },
  aktif: { label: "Aktif", className: "bg-success/15 text-success hover:bg-success/20" },
  selesai: { label: "Selesai", className: "bg-primary/15 text-primary hover:bg-primary/20" },
};

const initialMockCustomers: Customer[] = [
  {
    id: "1",
    name: "SMA Negeri 1 Jakarta",
    picName: "Bpk. Ahmad",
    phones: ["08123456789", "08198765432"],
    city: "Jakarta Selatan",
    address: "Jl. Sudirman No. 123, Jakarta Selatan",
    status: "aktif",
    createdAt: "2025-12-01",
  },
  {
    id: "2",
    name: "SMP Islam Al-Azhar",
    picName: "Ibu Sari",
    phones: ["08567891234"],
    city: "Jakarta Timur",
    address: "Jl. Pemuda No. 45, Jakarta Timur",
    status: "aktif",
    createdAt: "2025-11-15",
  },
  {
    id: "3",
    name: "SD Tarakanita",
    picName: "Bpk. Budi",
    phones: ["08112233445"],
    city: "Tangerang",
    address: "Jl. BSD Green Office Park, Tangerang",
    status: "selesai",
    createdAt: "2025-10-20",
  },
  {
    id: "4",
    name: "SMA Gonzaga",
    picName: "Ibu Dewi",
    phones: ["08556677889", "02187654321"],
    city: "Jakarta Pusat",
    address: "Jl. Merdeka Barat No. 78, Jakarta Pusat",
    status: "prospek",
    createdAt: "2026-01-10",
  },
  {
    id: "5",
    name: "SMK Negeri 4 Bandung",
    picName: "Bpk. Eko",
    phones: ["08778899001"],
    city: "Bandung",
    address: "Jl. Asia Afrika No. 100, Bandung",
    status: "prospek",
    createdAt: "2026-01-12",
  },
];

const emptyFormData: CustomerFormData = {
  name: "",
  picName: "",
  phones: [""],
  city: "",
  address: "",
  status: "prospek",
};

export default function Pelanggan() {
  const [customers, setCustomers] = useState<Customer[]>(initialMockCustomers);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<CustomerFormData>(emptyFormData);

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch = customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.picName.toLowerCase().includes(searchQuery.toLowerCase());
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

  const handleSubmit = () => {
    if (!formData.name || !formData.picName || !formData.city) {
      return;
    }

    const newCustomer: Customer = {
      id: String(Date.now()),
      name: formData.name,
      picName: formData.picName,
      phones: formData.phones.filter(p => p.trim() !== ""),
      city: formData.city,
      address: formData.address,
      status: formData.status,
      createdAt: new Date().toISOString().split("T")[0],
    };

    setCustomers(prev => [newCustomer, ...prev]);
    setFormData(emptyFormData);
    setIsDialogOpen(false);
  };

  const handleDialogClose = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setFormData(emptyFormData);
    }
  };

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
                      <DropdownMenuItem>Buat SPH</DropdownMenuItem>
                      <DropdownMenuItem>Buat Order</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">Hapus</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <User className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
                    <p className="text-sm font-medium text-foreground">{customer.picName}</p>
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
                      {customer.phones.map((phone, idx) => (
                        <span key={idx} className="text-sm text-foreground">
                          {phone}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex gap-2 border-t border-border pt-4">
                  <Button variant="outline" size="sm" className="flex-1">
                    Buat SPH
                  </Button>
                  <Button size="sm" className="flex-1">
                    Buat Order
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

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
                <Label htmlFor="picName">Nama PIC *</Label>
                <Input 
                  id="picName" 
                  placeholder="Contoh: Bpk. Ahmad / Ibu Sari" 
                  value={formData.picName}
                  onChange={(e) => setFormData(prev => ({ ...prev, picName: e.target.value }))}
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
              <Button onClick={handleSubmit} disabled={!formData.name || !formData.picName || !formData.city}>
                <Plus className="mr-2 h-4 w-4" />
                Simpan Pelanggan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
