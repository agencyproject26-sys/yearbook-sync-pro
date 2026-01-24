import { useState } from "react";
import { Plus, Search, Filter, MoreHorizontal, X, Loader2, FileText, ExternalLink, Pencil, Link2, Copy, User } from "lucide-react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { useCustomers, CustomerFormData, Customer, PIC } from "@/hooks/useCustomers";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";

const statusConfig = {
  prospek: { label: "Prospek", className: "bg-warning/15 text-warning hover:bg-warning/20" },
  aktif: { label: "Aktif", className: "bg-success/15 text-success hover:bg-success/20" },
  selesai: { label: "Selesai", className: "bg-primary/15 text-primary hover:bg-primary/20" },
};

const emptyPIC: PIC = {
  name: "",
  phones: [""],
};

const emptyFormData: CustomerFormData = {
  name: "",
  pics: [{ ...emptyPIC }],
  city: "",
  kecamatan: "",
  kelurahan: "",
  address: "",
  status: "prospek",
};

export default function Pelanggan() {
  const { customers, loading, addCustomer, deleteCustomer, updateCustomer, refetch } = useCustomers();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<CustomerFormData>(emptyFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Edit dialog state
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<CustomerFormData>(emptyFormData);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);
  
  // SPH dialog state
  const [isSphDialogOpen, setIsSphDialogOpen] = useState(false);
  const [sphLink, setSphLink] = useState("");
  const [isSphSubmitting, setIsSphSubmitting] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const filteredCustomers = customers.filter((customer) => {
    const picsMatch = customer.pics?.some(pic => 
      pic.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const matchesSearch = customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      picsMatch;
    const matchesStatus = statusFilter === "all" || customer.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Group customers by city and sort alphabetically
  const groupedCustomers = filteredCustomers.reduce((acc, customer) => {
    const city = customer.city || "Lainnya";
    if (!acc[city]) {
      acc[city] = [];
    }
    acc[city].push(customer);
    return acc;
  }, {} as Record<string, Customer[]>);

  // Sort customers within each city alphabetically by name
  Object.keys(groupedCustomers).forEach((city) => {
    groupedCustomers[city].sort((a, b) => a.name.localeCompare(b.name, 'id'));
  });

  // Sort cities alphabetically
  const sortedCities = Object.keys(groupedCustomers).sort((a, b) => a.localeCompare(b, 'id'));

  // PIC handlers for Add dialog
  const handleAddPIC = () => {
    setFormData(prev => ({ ...prev, pics: [...prev.pics, { ...emptyPIC }] }));
  };

  const handleRemovePIC = (picIndex: number) => {
    if (formData.pics.length > 1) {
      setFormData(prev => ({ ...prev, pics: prev.pics.filter((_, i) => i !== picIndex) }));
    }
  };

  const handlePICNameChange = (picIndex: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      pics: prev.pics.map((pic, i) => i === picIndex ? { ...pic, name: value } : pic)
    }));
  };

  const handleAddPhone = (picIndex: number) => {
    setFormData(prev => ({
      ...prev,
      pics: prev.pics.map((pic, i) => i === picIndex ? { ...pic, phones: [...pic.phones, ""] } : pic)
    }));
  };

  const handlePhoneChange = (picIndex: number, phoneIndex: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      pics: prev.pics.map((pic, i) => {
        if (i !== picIndex) return pic;
        const newPhones = [...pic.phones];
        newPhones[phoneIndex] = value;
        return { ...pic, phones: newPhones };
      })
    }));
  };

  const handleRemovePhone = (picIndex: number, phoneIndex: number) => {
    setFormData(prev => ({
      ...prev,
      pics: prev.pics.map((pic, i) => {
        if (i !== picIndex) return pic;
        if (pic.phones.length > 1) {
          return { ...pic, phones: pic.phones.filter((_, j) => j !== phoneIndex) };
        }
        return pic;
      })
    }));
  };

  const handleSubmit = async () => {
    const hasValidPIC = formData.pics.some(pic => pic.name.trim() !== "");
    if (!formData.name || !hasValidPIC || !formData.city) return;
    
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

  // PIC handlers for Edit dialog
  const handleEditAddPIC = () => {
    setEditFormData(prev => ({ ...prev, pics: [...prev.pics, { ...emptyPIC }] }));
  };

  const handleEditRemovePIC = (picIndex: number) => {
    if (editFormData.pics.length > 1) {
      setEditFormData(prev => ({ ...prev, pics: prev.pics.filter((_, i) => i !== picIndex) }));
    }
  };

  const handleEditPICNameChange = (picIndex: number, value: string) => {
    setEditFormData(prev => ({
      ...prev,
      pics: prev.pics.map((pic, i) => i === picIndex ? { ...pic, name: value } : pic)
    }));
  };

  const handleEditAddPhone = (picIndex: number) => {
    setEditFormData(prev => ({
      ...prev,
      pics: prev.pics.map((pic, i) => i === picIndex ? { ...pic, phones: [...pic.phones, ""] } : pic)
    }));
  };

  const handleEditPhoneChange = (picIndex: number, phoneIndex: number, value: string) => {
    setEditFormData(prev => ({
      ...prev,
      pics: prev.pics.map((pic, i) => {
        if (i !== picIndex) return pic;
        const newPhones = [...pic.phones];
        newPhones[phoneIndex] = value;
        return { ...pic, phones: newPhones };
      })
    }));
  };

  const handleEditRemovePhone = (picIndex: number, phoneIndex: number) => {
    setEditFormData(prev => ({
      ...prev,
      pics: prev.pics.map((pic, i) => {
        if (i !== picIndex) return pic;
        if (pic.phones.length > 1) {
          return { ...pic, phones: pic.phones.filter((_, j) => j !== phoneIndex) };
        }
        return pic;
      })
    }));
  };

  // Handle Edit customer
  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer);
    setEditFormData({
      name: customer.name,
      pics: customer.pics?.length > 0 
        ? customer.pics.map(pic => ({ 
            name: pic.name, 
            phones: pic.phones?.length > 0 ? pic.phones : [""] 
          }))
        : [{ name: customer.pic_name || "", phones: customer.phones?.length > 0 ? customer.phones : [""] }],
      city: customer.city,
      kecamatan: customer.kecamatan || "",
      kelurahan: customer.kelurahan || "",
      address: customer.address || "",
      status: customer.status,
    });
    setIsEditDialogOpen(true);
  };

  const handleEditSubmit = async () => {
    const hasValidPIC = editFormData.pics.some(pic => pic.name.trim() !== "");
    if (!editingCustomer || !editFormData.name || !hasValidPIC || !editFormData.city) return;
    
    setIsEditSubmitting(true);
    const success = await updateCustomer(editingCustomer.id, editFormData);
    setIsEditSubmitting(false);
    
    if (success) {
      setEditFormData(emptyFormData);
      setEditingCustomer(null);
      setIsEditDialogOpen(false);
    }
  };

  const handleEditDialogClose = (open: boolean) => {
    setIsEditDialogOpen(open);
    if (!open) {
      setEditFormData(emptyFormData);
      setEditingCustomer(null);
    }
  };

  // Handle SPH (Surat Penawaran Harga)
  const handleCreateSph = (customer: Customer) => {
    setSelectedCustomer(customer);
    setSphLink(customer.sph_link || "");
    setIsSphDialogOpen(true);
  };

  const handleSaveSphLink = async () => {
    if (!selectedCustomer) return;
    
    setIsSphSubmitting(true);
    const { error } = await supabase
      .from("customers")
      .update({ sph_link: sphLink || null })
      .eq("id", selectedCustomer.id);
    
    if (!error) {
      toast({
        title: "Berhasil",
        description: "Link SPH berhasil disimpan",
      });
      refetch();
    } else {
      toast({
        title: "Error",
        description: "Gagal menyimpan link SPH",
        variant: "destructive",
      });
    }
    setIsSphSubmitting(false);
    setIsSphDialogOpen(false);
    setSelectedCustomer(null);
  };

  const openSphLink = (link: string) => {
    window.open(link, "_blank");
  };

  const openWhatsApp = async (waPhone: string, displayPhone: string) => {
    try {
      window.location.href = `whatsapp://send?phone=${waPhone}`;
    } catch {
      // ignore
    }

    window.setTimeout(() => {
      window.open(`https://wa.me/${waPhone}`, "_blank", "noopener,noreferrer");
    }, 400);

    try {
      await navigator.clipboard.writeText(displayPhone);
      toast({
        title: "Nomor disalin",
        description: "Jika WhatsApp diblokir jaringan/browser, buka WhatsApp lalu paste nomor ini.",
      });
    } catch {
      toast({
        title: "WhatsApp terblokir",
        description: "Sepertinya domain WhatsApp diblokir. Coba pakai WhatsApp Desktop/Mobile, atau copy nomor secara manual.",
        variant: "destructive",
      });
    }
  };

  const formatPhoneForWhatsApp = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    return cleanPhone.startsWith('0') 
      ? '62' + cleanPhone.slice(1) 
      : cleanPhone.startsWith('62') 
        ? cleanPhone 
        : '62' + cleanPhone;
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
        showSearch={false}
        showNotifications={false}
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

        {/* Customer Table */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Pelanggan</TableHead>
                <TableHead>PIC & Kontak</TableHead>
                <TableHead>Wilayah</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">SPH</TableHead>
                <TableHead className="w-[60px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedCities.map((city) => (
                <>
                  {/* City Header Row */}
                  <TableRow key={`city-${city}`} className="bg-muted/50 hover:bg-muted/50">
                    <TableCell colSpan={6} className="py-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">{city}</span>
                        <Badge variant="secondary" className="text-xs">
                          {groupedCustomers[city].length} pelanggan
                        </Badge>
                      </div>
                    </TableCell>
                  </TableRow>
                  {/* Customer Rows */}
                  {groupedCustomers[city].map((customer) => {
                    const status = statusConfig[customer.status];
                    return (
                      <TableRow key={customer.id}>
                        <TableCell className="font-medium pl-6">{customer.name}</TableCell>
                        <TableCell>
                          <div className="space-y-2">
                            {customer.pics?.map((pic, picIdx) => (
                              <div key={picIdx} className="border-l-2 border-primary/30 pl-2">
                                <p className="font-medium text-sm flex items-center gap-1">
                                  <User className="h-3 w-3 text-muted-foreground" />
                                  {pic.name}
                                </p>
                                {pic.phones?.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {pic.phones.filter(phone => phone).map((phone, phoneIdx) => {
                                      const waPhone = formatPhoneForWhatsApp(phone);
                                      return (
                                        <div key={phoneIdx} className="inline-flex items-center gap-1">
                                          <span className="text-xs text-muted-foreground">{phone}</span>
                                          <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 bg-green-500 hover:bg-green-600 text-white rounded-full"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              openWhatsApp(waPhone, phone);
                                            }}
                                            aria-label={`WhatsApp ${phone}`}
                                          >
                                            <svg
                                              viewBox="0 0 24 24"
                                              className="h-3 w-3 fill-current"
                                              xmlns="http://www.w3.org/2000/svg"
                                            >
                                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                            </svg>
                                          </Button>
                                          <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="h-5 w-5"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              navigator.clipboard
                                                .writeText(phone)
                                                .then(() => toast({ title: "Nomor disalin" }))
                                                .catch(() => toast({ title: "Gagal menyalin", variant: "destructive" }));
                                            }}
                                            aria-label={`Copy nomor ${phone}`}
                                          >
                                            <Copy className="h-3 w-3" />
                                          </Button>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p className="text-muted-foreground">{customer.city}</p>
                            {(customer.kecamatan || customer.kelurahan) && (
                              <p className="text-xs text-muted-foreground/70">
                                {[customer.kecamatan, customer.kelurahan].filter(Boolean).join(", ")}
                              </p>
                            )}
                            {customer.address && (
                              <p className="text-xs text-muted-foreground/60 mt-1">
                                {customer.address}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={cn(status.className)}>{status.label}</Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCreateSph(customer)}
                            >
                              <FileText className="mr-1 h-3 w-3" />
                              {customer.sph_link ? "Edit" : "Buat"} SPH
                            </Button>
                            {customer.sph_link && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-success"
                                onClick={() => openSphLink(customer.sph_link!)}
                              >
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditCustomer(customer)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-destructive"
                                onClick={() => deleteCustomer(customer.id)}
                              >
                                Hapus
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </>
              ))}
            </TableBody>
          </Table>
          
          {filteredCustomers.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium">Belum ada pelanggan</h3>
              <p className="text-sm text-muted-foreground">Klik tombol "Tambah Pelanggan" untuk menambahkan pelanggan baru.</p>
            </div>
          )}
        </div>

        {/* Add Customer Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
          <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
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

              {/* Multiple PIC Section */}
              <div className="grid gap-3">
                <div className="flex items-center justify-between">
                  <Label>PIC (Person In Charge) *</Label>
                  <Button variant="outline" size="sm" onClick={handleAddPIC}>
                    <Plus className="mr-1 h-3 w-3" />
                    Tambah PIC
                  </Button>
                </div>
                
                {formData.pics.map((pic, picIndex) => (
                  <div key={picIndex} className="rounded-lg border border-border p-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">PIC {picIndex + 1}</span>
                      {formData.pics.length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-destructive"
                          onClick={() => handleRemovePIC(picIndex)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor={`pic_name_${picIndex}`}>Nama PIC</Label>
                      <Input 
                        id={`pic_name_${picIndex}`}
                        placeholder="Contoh: Bpk. Ahmad / Ibu Sari" 
                        value={pic.name}
                        onChange={(e) => handlePICNameChange(picIndex, e.target.value)}
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label>Nomor Telepon</Label>
                      {pic.phones.map((phone, phoneIndex) => (
                        <div key={phoneIndex} className="flex gap-2">
                          <Input 
                            placeholder="08xxxxxxxxxx" 
                            value={phone}
                            onChange={(e) => handlePhoneChange(picIndex, phoneIndex, e.target.value)}
                          />
                          {pic.phones.length > 1 && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleRemovePhone(picIndex, phoneIndex)}
                              className="shrink-0"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button variant="ghost" size="sm" className="w-fit" onClick={() => handleAddPhone(picIndex)}>
                        <Plus className="mr-1 h-3 w-3" />
                        Tambah Nomor
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="grid gap-2">
                <Label htmlFor="city">Kota / Kabupaten *</Label>
                <Input 
                  id="city" 
                  placeholder="Contoh: Jakarta Selatan" 
                  value={formData.city}
                  onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="kecamatan">Kecamatan</Label>
                  <Input 
                    id="kecamatan" 
                    placeholder="Contoh: Kebayoran Baru" 
                    value={formData.kecamatan}
                    onChange={(e) => setFormData(prev => ({ ...prev, kecamatan: e.target.value }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="kelurahan">Kelurahan</Label>
                  <Input 
                    id="kelurahan" 
                    placeholder="Contoh: Senayan" 
                    value={formData.kelurahan}
                    onChange={(e) => setFormData(prev => ({ ...prev, kelurahan: e.target.value }))}
                  />
                </div>
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
                disabled={!formData.name || !formData.pics.some(p => p.name.trim()) || !formData.city || isSubmitting}
              >
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Plus className="mr-2 h-4 w-4" />
                Tambah Pelanggan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Customer Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={handleEditDialogClose}>
          <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Pelanggan</DialogTitle>
              <DialogDescription>
                Perbarui informasi pelanggan.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit_name">Nama Sekolah *</Label>
                <Input 
                  id="edit_name" 
                  value={editFormData.name}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              {/* Multiple PIC Section for Edit */}
              <div className="grid gap-3">
                <div className="flex items-center justify-between">
                  <Label>PIC (Person In Charge) *</Label>
                  <Button variant="outline" size="sm" onClick={handleEditAddPIC}>
                    <Plus className="mr-1 h-3 w-3" />
                    Tambah PIC
                  </Button>
                </div>
                
                {editFormData.pics.map((pic, picIndex) => (
                  <div key={picIndex} className="rounded-lg border border-border p-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">PIC {picIndex + 1}</span>
                      {editFormData.pics.length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-destructive"
                          onClick={() => handleEditRemovePIC(picIndex)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor={`edit_pic_name_${picIndex}`}>Nama PIC</Label>
                      <Input 
                        id={`edit_pic_name_${picIndex}`}
                        value={pic.name}
                        onChange={(e) => handleEditPICNameChange(picIndex, e.target.value)}
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label>Nomor Telepon</Label>
                      {pic.phones.map((phone, phoneIndex) => (
                        <div key={phoneIndex} className="flex gap-2">
                          <Input 
                            value={phone}
                            onChange={(e) => handleEditPhoneChange(picIndex, phoneIndex, e.target.value)}
                          />
                          {pic.phones.length > 1 && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleEditRemovePhone(picIndex, phoneIndex)}
                              className="shrink-0"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button variant="ghost" size="sm" className="w-fit" onClick={() => handleEditAddPhone(picIndex)}>
                        <Plus className="mr-1 h-3 w-3" />
                        Tambah Nomor
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="grid gap-2">
                <Label htmlFor="edit_city">Kota / Kabupaten *</Label>
                <Input 
                  id="edit_city" 
                  value={editFormData.city}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, city: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit_kecamatan">Kecamatan</Label>
                  <Input 
                    id="edit_kecamatan" 
                    value={editFormData.kecamatan}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, kecamatan: e.target.value }))}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit_kelurahan">Kelurahan</Label>
                  <Input 
                    id="edit_kelurahan" 
                    value={editFormData.kelurahan}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, kelurahan: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit_address">Alamat Lengkap</Label>
                <Textarea 
                  id="edit_address" 
                  value={editFormData.address}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, address: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit_status">Status</Label>
                <Select 
                  value={editFormData.status} 
                  onValueChange={(value: "prospek" | "aktif" | "selesai") => 
                    setEditFormData(prev => ({ ...prev, status: value }))
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
              <Button variant="outline" onClick={() => handleEditDialogClose(false)}>
                Batal
              </Button>
              <Button 
                onClick={handleEditSubmit} 
                disabled={!editFormData.name || !editFormData.pics.some(p => p.name.trim()) || !editFormData.city || isEditSubmitting}
              >
                {isEditSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Simpan Perubahan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* SPH Dialog - Manual Link Only */}
        <Dialog open={isSphDialogOpen} onOpenChange={(open) => { setIsSphDialogOpen(open); if (!open) setSelectedCustomer(null); }}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Konfigurasi Link SPH</DialogTitle>
              <DialogDescription>
                Surat Penawaran Harga untuk {selectedCustomer?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="rounded-lg border border-border bg-muted/30 p-3">
                <p className="font-medium">{selectedCustomer?.name}</p>
                <p className="text-sm text-muted-foreground">
                  PIC: {selectedCustomer?.pics?.map(p => p.name).join(", ") || selectedCustomer?.pic_name}
                </p>
                <p className="text-sm text-muted-foreground">{selectedCustomer?.city}</p>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="sph_link">Link SPH</Label>
                <div className="flex gap-2">
                  <Input 
                    id="sph_link" 
                    placeholder="https://www.canva.com/design/..." 
                    value={sphLink}
                    onChange={(e) => setSphLink(e.target.value)}
                  />
                  {sphLink && (
                    <Button variant="ghost" size="icon" onClick={() => openSphLink(sphLink)}>
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Masukkan link SPH dari Canva atau sumber lainnya
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsSphDialogOpen(false)}>
                Batal
              </Button>
              <Button onClick={handleSaveSphLink} disabled={isSphSubmitting}>
                {isSphSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Link2 className="mr-2 h-4 w-4" />
                Simpan Link
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
