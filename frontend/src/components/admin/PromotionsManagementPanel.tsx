import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useCreatePromoCode, useDeactivatePromoCode, useListApprovals } from '../../hooks/useQueries';
import { useQuery } from '@tanstack/react-query';
import { useActor } from '../../hooks/useActor';
import { DiscountCode } from '../../backend';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Plus, Tag, XCircle } from 'lucide-react';

export default function PromotionsManagementPanel() {
  const { t } = useLanguage();
  const { actor, isFetching } = useActor();
  const createPromo = useCreatePromoCode();
  const deactivatePromo = useDeactivatePromoCode();

  const [code, setCode] = useState('');
  const [percentage, setPercentage] = useState(10);
  const [expiry, setExpiry] = useState('');
  const [error, setError] = useState('');

  // We don't have a listPromoCodes endpoint, so we track locally via a simple state
  const [localCodes, setLocalCodes] = useState<DiscountCode[]>([]);

  const handleCreate = async () => {
    if (!code.trim() || !expiry) { setError('Code and expiry are required'); return; }
    setError('');
    try {
      const expiryMs = BigInt(new Date(expiry).getTime()) * BigInt(1_000_000);
      const result = await createPromo.mutateAsync({
        code: code.trim().toUpperCase(),
        percentage: BigInt(percentage),
        expiry: expiryMs,
      });
      setLocalCodes(prev => [...prev, result]);
      setCode('');
      setExpiry('');
      setPercentage(10);
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to create promo code');
    }
  };

  const handleDeactivate = async (promoCode: string) => {
    await deactivatePromo.mutateAsync(promoCode);
    setLocalCodes(prev => prev.map(c => c.code === promoCode ? { ...c, isActive: false } : c));
  };

  return (
    <div className="space-y-6">
      <h2 className="font-serif font-bold text-xl text-foreground">{t('admin.promotions')}</h2>

      {/* Create form */}
      <div className="luxury-card p-5 space-y-4">
        <h3 className="font-semibold text-gold flex items-center gap-2">
          <Tag className="w-4 h-4" />{t('admin.createPromo')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">Promo Code</Label>
            <Input
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              placeholder="SUMMER20"
              className="bg-secondary border-border uppercase"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">Expiry Date</Label>
            <Input
              type="date"
              value={expiry}
              min={new Date().toISOString().split('T')[0]}
              onChange={e => setExpiry(e.target.value)}
              className="bg-secondary border-border"
            />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider">Discount</Label>
              <span className="text-sm font-bold text-gold">{percentage}%</span>
            </div>
            <Slider
              min={1} max={100} step={1}
              value={[percentage]}
              onValueChange={([v]) => setPercentage(v)}
              className="[&_[role=slider]]:bg-gold [&_[role=slider]]:border-gold"
            />
          </div>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button onClick={handleCreate} disabled={createPromo.isPending} className="bg-gold text-charcoal hover:bg-gold-light font-semibold">
          {createPromo.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
          Create Promo Code
        </Button>
      </div>

      {/* Codes table */}
      {localCodes.length > 0 && (
        <div className="luxury-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground">Code</TableHead>
                <TableHead className="text-muted-foreground">Discount</TableHead>
                <TableHead className="text-muted-foreground">Expiry</TableHead>
                <TableHead className="text-muted-foreground">Status</TableHead>
                <TableHead className="text-muted-foreground">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {localCodes.map(promo => (
                <TableRow key={promo.code} className="border-border hover:bg-secondary/50">
                  <TableCell className="font-mono font-bold text-gold">{promo.code}</TableCell>
                  <TableCell>{promo.percentage.toString()}%</TableCell>
                  <TableCell className="text-xs">{new Date(Number(promo.expiry) / 1_000_000).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${promo.isActive ? 'bg-green-600/20 text-green-400' : 'bg-secondary text-muted-foreground'}`}>
                      {promo.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </TableCell>
                  <TableCell>
                    {promo.isActive && (
                      <Button size="sm" variant="ghost" onClick={() => handleDeactivate(promo.code)} disabled={deactivatePromo.isPending} className="h-7 text-destructive hover:text-destructive/80 text-xs gap-1">
                        <XCircle className="w-3.5 h-3.5" />Deactivate
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
