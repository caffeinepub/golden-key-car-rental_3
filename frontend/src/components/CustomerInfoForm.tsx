import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  license: string;
}

interface CustomerInfoFormProps {
  data: CustomerInfo;
  onChange: (data: CustomerInfo) => void;
  errors: Partial<CustomerInfo>;
}

export default function CustomerInfoForm({ data, onChange, errors }: CustomerInfoFormProps) {
  const { t } = useLanguage();

  const update = (key: keyof CustomerInfo, value: string) => {
    onChange({ ...data, [key]: value });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-1.5">
        <Label className="text-sm text-muted-foreground">{t('booking.name')} *</Label>
        <Input
          value={data.name}
          onChange={e => update('name', e.target.value)}
          className={`bg-secondary border-border ${errors.name ? 'border-destructive' : ''}`}
          placeholder="John Doe"
        />
        {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
      </div>

      <div className="space-y-1.5">
        <Label className="text-sm text-muted-foreground">{t('booking.email')} *</Label>
        <Input
          type="email"
          value={data.email}
          onChange={e => update('email', e.target.value)}
          className={`bg-secondary border-border ${errors.email ? 'border-destructive' : ''}`}
          placeholder="john@example.com"
        />
        {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
      </div>

      <div className="space-y-1.5">
        <Label className="text-sm text-muted-foreground">{t('booking.phone')} *</Label>
        <Input
          type="tel"
          value={data.phone}
          onChange={e => update('phone', e.target.value)}
          className={`bg-secondary border-border ${errors.phone ? 'border-destructive' : ''}`}
          placeholder="+971 50 123 4567"
        />
        {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
      </div>

      <div className="space-y-1.5">
        <Label className="text-sm text-muted-foreground">{t('booking.license')} *</Label>
        <Input
          value={data.license}
          onChange={e => update('license', e.target.value)}
          className={`bg-secondary border-border ${errors.license ? 'border-destructive' : ''}`}
          placeholder="DL-123456789"
        />
        {errors.license && <p className="text-xs text-destructive">{errors.license}</p>}
      </div>
    </div>
  );
}
