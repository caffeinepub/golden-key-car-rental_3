import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Baby, UserPlus, Infinity } from 'lucide-react';

export interface SelectedAddOn {
  name: string;
  dailyCostUSD: number;
  selected: boolean;
}

interface AddOnsSelectorProps {
  addOns: SelectedAddOn[];
  onChange: (addOns: SelectedAddOn[]) => void;
}

const ADD_ON_ICONS: Record<string, React.ReactNode> = {
  'Child Seat': <Baby className="w-4 h-4 text-gold" />,
  'Additional Driver': <UserPlus className="w-4 h-4 text-gold" />,
  'Unlimited KM': <Infinity className="w-4 h-4 text-gold" />,
};

export default function AddOnsSelector({ addOns, onChange }: AddOnsSelectorProps) {
  const { t } = useLanguage();

  const toggle = (idx: number) => {
    const updated = addOns.map((a, i) => i === idx ? { ...a, selected: !a.selected } : a);
    onChange(updated);
  };

  const totalDailyCost = addOns.filter(a => a.selected).reduce((sum, a) => sum + a.dailyCostUSD, 0);

  return (
    <div className="space-y-3">
      {addOns.map((addOn, idx) => (
        <div
          key={idx}
          className={`luxury-card p-4 flex items-center gap-4 cursor-pointer transition-all ${
            addOn.selected ? 'border-gold/50 bg-gold/5' : 'hover:border-border/80'
          }`}
          onClick={() => toggle(idx)}
        >
          <Checkbox
            checked={addOn.selected}
            onCheckedChange={() => toggle(idx)}
            className="border-gold data-[state=checked]:bg-gold data-[state=checked]:border-gold"
          />
          <div className="flex items-center gap-2 flex-1">
            {ADD_ON_ICONS[addOn.name] || null}
            <div>
              <p className="font-medium text-sm text-foreground">{addOn.name}</p>
              <p className="text-xs text-muted-foreground">+${addOn.dailyCostUSD}/day</p>
            </div>
          </div>
          <span className={`text-sm font-semibold ${addOn.selected ? 'text-gold' : 'text-muted-foreground'}`}>
            ${addOn.dailyCostUSD}/day
          </span>
        </div>
      ))}

      {totalDailyCost > 0 && (
        <div className="flex justify-between text-sm font-semibold pt-2 border-t border-border">
          <span className="text-muted-foreground">Add-ons total:</span>
          <span className="text-gold">+${totalDailyCost}/day</span>
        </div>
      )}
    </div>
  );
}
