import { useSettingsStore } from "@/store/useSettingsStore";
import { wt, type WebsiteTranslationKey } from "@/i18n/websiteTranslations";

export function useWT() {
  const lang = useSettingsStore((s) => s.lang);
  return (key: WebsiteTranslationKey) => wt(lang, key);
}
