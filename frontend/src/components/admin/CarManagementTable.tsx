import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useGetAvailableCars, useCreateCar, useUpdateCar, useDeleteCar } from '../../hooks/useQueries';
import { Car, CarCategory, TransmissionType } from '../../backend';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Plus, Edit2, Trash2, ImageOff } from 'lucide-react';

interface CarFormData {
  name: string;
  category: CarCategory;
  transmission: TransmissionType;
  dailyRateUSD: string;
  imageUrls: string;
  availability: boolean;
  isActive: boolean;
}

const DEFAULT_FORM: CarFormData = {
  name: '',
  category: CarCategory.economy,
  transmission: TransmissionType.automatic,
  dailyRateUSD: '',
  imageUrls: '',
  availability: true,
  isActive: true,
};

export default function CarManagementTable() {
  const { t } = useLanguage();
  const { data: cars = [], isLoading } = useGetAvailableCars();
  const createCar = useCreateCar();
  const updateCar = useUpdateCar();
  const deleteCar = useDeleteCar();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCar, setEditingCar] = useState<Car | null>(null);
  const [form, setForm] = useState<CarFormData>(DEFAULT_FORM);

  const openCreate = () => {
    setEditingCar(null);
    setForm(DEFAULT_FORM);
    setDialogOpen(true);
  };

  const openEdit = (car: Car) => {
    setEditingCar(car);
    setForm({
      name: car.name,
      category: car.category,
      transmission: car.transmission,
      dailyRateUSD: car.dailyRateUSD.toString(),
      imageUrls: car.imageUrls.join('\n'),
      availability: car.availability,
      isActive: car.isActive,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    const imageUrls = form.imageUrls.split('\n').map(u => u.trim()).filter(Boolean);
    const rate = parseFloat(form.dailyRateUSD);
    if (!form.name || isNaN(rate)) return;

    try {
      if (editingCar) {
        await updateCar.mutateAsync({
          carId: editingCar.id,
          name: form.name,
          category: form.category,
          transmission: form.transmission,
          dailyRateUSD: rate,
          imageUrls,
          availability: form.availability,
          isActive: form.isActive,
        });
      } else {
        await createCar.mutateAsync({
          name: form.name,
          category: form.category,
          transmission: form.transmission,
          dailyRateUSD: rate,
          imageUrls,
        });
      }
      setDialogOpen(false);
    } catch {
      // error handled by mutation
    }
  };

  const handleDelete = async (carId: bigint) => {
    if (!confirm('Are you sure you want to delete this car?')) return;
    await deleteCar.mutateAsync(carId);
  };

  const isSaving = createCar.isPending || updateCar.isPending;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-serif font-bold text-xl text-foreground">{t('admin.cars')}</h2>
        <Button onClick={openCreate} className="bg-gold text-charcoal hover:bg-gold-light font-semibold">
          <Plus className="w-4 h-4 mr-2" />{t('admin.addCar')}
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 text-muted-foreground py-8">
          <Loader2 className="w-5 h-5 animate-spin" />{t('common.loading')}
        </div>
      ) : (
        <div className="luxury-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground">Image</TableHead>
                <TableHead className="text-muted-foreground">Name</TableHead>
                <TableHead className="text-muted-foreground">Category</TableHead>
                <TableHead className="text-muted-foreground">Transmission</TableHead>
                <TableHead className="text-muted-foreground">Rate/Day</TableHead>
                <TableHead className="text-muted-foreground">Available</TableHead>
                <TableHead className="text-muted-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cars.map(car => (
                <TableRow key={car.id.toString()} className="border-border hover:bg-secondary/50">
                  <TableCell>
                    {car.imageUrls[0] ? (
                      <img src={car.imageUrls[0]} alt={car.name} className="w-16 h-10 object-cover rounded" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    ) : (
                      <div className="w-16 h-10 bg-secondary rounded flex items-center justify-center">
                        <ImageOff className="w-4 h-4 text-muted-foreground" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{car.name}</TableCell>
                  <TableCell className="capitalize">{String(car.category)}</TableCell>
                  <TableCell className="capitalize">{String(car.transmission)}</TableCell>
                  <TableCell className="text-gold font-semibold">${car.dailyRateUSD}</TableCell>
                  <TableCell>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${car.availability ? 'bg-green-600/20 text-green-400' : 'bg-destructive/20 text-destructive'}`}>
                      {car.availability ? 'Yes' : 'No'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" onClick={() => openEdit(car)} className="h-7 w-7 p-0 text-muted-foreground hover:text-gold">
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(car.id)} disabled={deleteCar.isPending} className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive">
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-card border-border max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif text-gold">
              {editingCar ? t('admin.editCar') : t('admin.addCar')}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-sm text-muted-foreground">Car Name *</Label>
              <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="bg-secondary border-border" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-sm text-muted-foreground">Category</Label>
                <Select value={form.category} onValueChange={v => setForm(p => ({ ...p, category: v as CarCategory }))}>
                  <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value={CarCategory.economy}>Economy</SelectItem>
                    <SelectItem value={CarCategory.suv}>SUV</SelectItem>
                    <SelectItem value={CarCategory.luxury}>Luxury</SelectItem>
                    <SelectItem value={CarCategory.van}>Van</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm text-muted-foreground">Transmission</Label>
                <Select value={form.transmission} onValueChange={v => setForm(p => ({ ...p, transmission: v as TransmissionType }))}>
                  <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value={TransmissionType.automatic}>Automatic</SelectItem>
                    <SelectItem value={TransmissionType.manual}>Manual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm text-muted-foreground">Daily Rate (USD) *</Label>
              <Input type="number" value={form.dailyRateUSD} onChange={e => setForm(p => ({ ...p, dailyRateUSD: e.target.value }))} className="bg-secondary border-border" placeholder="99.00" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm text-muted-foreground">Image URLs (one per line)</Label>
              <textarea
                value={form.imageUrls}
                onChange={e => setForm(p => ({ ...p, imageUrls: e.target.value }))}
                className="w-full bg-secondary border border-border rounded px-3 py-2 text-sm text-foreground resize-none h-20"
                placeholder="https://example.com/car.jpg"
              />
            </div>
            {editingCar && (
              <div className="flex items-center gap-3">
                <Switch checked={form.availability} onCheckedChange={v => setForm(p => ({ ...p, availability: v }))} className="data-[state=checked]:bg-gold" />
                <Label className="text-sm">Available for booking</Label>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialogOpen(false)}>{t('common.cancel')}</Button>
            <Button onClick={handleSave} disabled={isSaving} className="bg-gold text-charcoal hover:bg-gold-light font-semibold">
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {t('common.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
