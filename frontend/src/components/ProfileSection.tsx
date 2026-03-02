import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useGetCallerUserProfile, useSaveCallerUserProfile } from '../hooks/useQueries';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2, Edit2, Save, X } from 'lucide-react';

export default function ProfileSection() {
  const { t } = useLanguage();
  const { data: profile, isLoading } = useGetCallerUserProfile();
  const saveProfile = useSaveCallerUserProfile();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '' });

  useEffect(() => {
    if (profile) {
      setForm({ name: profile.name, email: profile.email, phone: profile.phone });
    }
  }, [profile]);

  const handleSave = async () => {
    try {
      await saveProfile.mutateAsync(form);
      setEditing(false);
    } catch {
      // error handled by mutation
    }
  };

  if (isLoading) {
    return <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" />{t('common.loading')}</div>;
  }

  return (
    <div className="luxury-card p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="font-serif font-bold text-lg text-foreground">{t('dashboard.profile')}</h3>
        {!editing ? (
          <Button variant="ghost" size="sm" onClick={() => setEditing(true)} className="text-gold hover:text-gold-light">
            <Edit2 className="w-4 h-4 mr-1" />{t('dashboard.editProfile')}
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => setEditing(false)} className="text-muted-foreground">
              <X className="w-4 h-4 mr-1" />{t('common.cancel')}
            </Button>
            <Button size="sm" onClick={handleSave} disabled={saveProfile.isPending} className="bg-gold text-charcoal hover:bg-gold-light">
              {saveProfile.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Save className="w-4 h-4 mr-1" />}
              {t('dashboard.saveProfile')}
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(['name', 'email', 'phone'] as const).map(field => (
          <div key={field} className="space-y-1.5">
            <Label className="text-xs text-muted-foreground uppercase tracking-wider">
              {t(`booking.${field}`)}
            </Label>
            {editing ? (
              <Input
                value={form[field]}
                onChange={e => setForm(prev => ({ ...prev, [field]: e.target.value }))}
                className="bg-secondary border-border"
                type={field === 'email' ? 'email' : field === 'phone' ? 'tel' : 'text'}
              />
            ) : (
              <p className="text-sm text-foreground py-2 px-3 bg-secondary rounded border border-border">
                {profile?.[field] || <span className="text-muted-foreground italic">Not set</span>}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
