import { Suspense } from "react"
import { AccountSettingsForm } from "@/components/auth/account-settings-form"
import { Loader2 } from "lucide-react"

function SettingsLoader() {
  return (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="size-8 animate-spin text-muted-foreground" />
    </div>
  )
}

export default function AccountSettingsPage() {
  return (
    <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="w-full max-w-2xl">
        <Suspense fallback={<SettingsLoader />}>
          <AccountSettingsForm />
        </Suspense>
      </div>
    </div>
  )
}
