import { DarshanScreen } from '@/components/temple/darshan-screen'
import { LanguageProvider } from '@/lib/i18n'

export default function TemplePage() {
  return (
    <div className="h-full w-full overflow-hidden bg-[#FCF6E8] dark:bg-[#0d0705]">
      <LanguageProvider>
        <DarshanScreen />
      </LanguageProvider>
    </div>
  )
}
