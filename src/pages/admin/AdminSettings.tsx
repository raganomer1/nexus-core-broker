import React, { useState } from 'react';
import { useStore } from '@/store/useStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { t } from '@/i18n/translations';
import { Checkbox } from '@/components/ui/checkbox';

export default function AdminSettings() {
  const { clientStatusConfigs, actionStatusConfigs, reminderIntervals, securitySettings, updateSecuritySettings } = useStore();
  const { lang } = useSettingsStore();
  const [tab, setTab] = useState<'statuses' | 'actions' | 'reminders' | 'security' | 'misc'>('statuses');

  const tabs = [
    { id: 'statuses', label: t(lang, 'clientStatuses') },
    { id: 'actions', label: t(lang, 'actionStatuses') },
    { id: 'reminders', label: t(lang, 'reminders') },
    { id: 'security', label: t(lang, 'security') },
    { id: 'misc', label: t(lang, 'additional') },
  ];

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-lg md:text-xl font-semibold mb-4">{t(lang, 'settings')}</h1>
      <div className="flex gap-1 mb-4 md:mb-6 flex-wrap overflow-x-auto">
        {tabs.map(tb => (
          <button key={tb.id} onClick={() => setTab(tb.id as any)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${tab === tb.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
            {tb.label}
          </button>
        ))}
      </div>

      {tab === 'statuses' && (
        <div className="bg-card rounded-lg border p-4 md:p-5 max-w-lg">
          <h3 className="text-sm font-semibold mb-4">{t(lang, 'clientStatuses')}</h3>
          <div className="space-y-2">
            {clientStatusConfigs.map(s => (
              <div key={s.id} className="flex items-center gap-3 p-2 bg-muted/30 rounded">
                <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ background: s.color }} />
                <span className="text-sm flex-1">{s.name}</span>
                {s.isDefault && <span className="text-xs text-primary">{t(lang, 'defaultStatus')}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'actions' && (
        <div className="bg-card rounded-lg border p-4 md:p-5 max-w-lg">
          <h3 className="text-sm font-semibold mb-4">{t(lang, 'actionStatuses')}</h3>
          <div className="space-y-2">
            {actionStatusConfigs.map(s => (
              <div key={s.id} className="flex items-center gap-3 p-2 bg-muted/30 rounded">
                <span className="text-sm flex-1">{s.name}</span>
                {s.isCompleted && <span className="status-badge status-live">{t(lang, 'completing')}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'reminders' && (
        <div className="bg-card rounded-lg border p-4 md:p-5 max-w-lg">
          <h3 className="text-sm font-semibold mb-4">{t(lang, 'reminderIntervals')}</h3>
          <div className="space-y-2">
            {reminderIntervals.map(r => (
              <div key={r.id} className="flex items-center gap-3 p-2 bg-muted/30 rounded">
                <span className="text-sm flex-1">{r.label}</span>
                {r.isDefault && <span className="text-xs text-primary">{t(lang, 'defaultStatus')}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'security' && (
        <div className="space-y-4 md:space-y-6 max-w-2xl">
          <div className="bg-card rounded-lg border p-4 md:p-5">
            <h3 className="text-sm font-semibold mb-3">{t(lang, 'contactProtection')}</h3>
            <label className="flex items-center gap-2 text-sm mb-3"><Checkbox checked={securitySettings.contactProtection} onCheckedChange={v => updateSecuritySettings({ contactProtection: !!v })} /> {t(lang, 'activateContactProtection')}</label>
            {securitySettings.contactProtection && (<div className="text-xs text-muted-foreground">{t(lang, 'hiddenFields')}: {securitySettings.protectedFields.join(', ')}</div>)}
          </div>
          <div className="bg-card rounded-lg border p-4 md:p-5">
            <h3 className="text-sm font-semibold mb-3">{t(lang, 'editProtection')}</h3>
            <label className="flex items-center gap-2 text-sm mb-3"><Checkbox checked={securitySettings.editProtection} onCheckedChange={v => updateSecuritySettings({ editProtection: !!v })} /> {t(lang, 'activateEditProtection')}</label>
          </div>
          <div className="bg-card rounded-lg border p-4 md:p-5">
            <h3 className="text-sm font-semibold mb-3">{t(lang, 'ipWhitelist')}</h3>
            <div className="space-y-2 mb-3">
              {securitySettings.ipWhitelist.map(ip => (<div key={ip.id} className="flex items-center gap-2 text-sm bg-muted/30 p-2 rounded"><span className="flex-1 text-xs md:text-sm">{ip.from} — {ip.to} {ip.label && `(${ip.label})`}</span></div>))}
              {securitySettings.ipWhitelist.length === 0 && <p className="text-sm text-muted-foreground">{t(lang, 'noRestrictions')}</p>}
            </div>
          </div>
          <div className="bg-card rounded-lg border p-4 md:p-5">
            <h3 className="text-sm font-semibold mb-3">{t(lang, 'additional')}</h3>
            <label className="flex items-center gap-2 text-sm"><Checkbox checked={securitySettings.showFullPhoneNumbers} onCheckedChange={v => updateSecuritySettings({ showFullPhoneNumbers: !!v })} /> {t(lang, 'showFullPhoneNumbers')}</label>
          </div>
        </div>
      )}

      {tab === 'misc' && (
        <div className="bg-card rounded-lg border p-4 md:p-5 max-w-lg">
          <h3 className="text-sm font-semibold mb-4">{t(lang, 'additionalSettings')}</h3>
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm"><Checkbox defaultChecked /> {t(lang, 'convertToLiveOnDeposit')}</label>
            <label className="flex items-center gap-2 text-sm"><Checkbox /> {t(lang, 'allowEditCreatedDate')}</label>
          </div>
        </div>
      )}
    </div>
  );
}
