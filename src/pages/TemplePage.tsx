import { DarshanScreen } from '@/components/temple/darshan-screen'
import { LanguageProvider } from '@/lib/i18n'

export default function TemplePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#0d0705]">
      <LanguageProvider>
        <DarshanScreen />
      </LanguageProvider>
    </main>
  )
}
