import { AccountSettingsForm } from "@/components/auth/account-settings-form"

export default function AccountSettingsPage() {
  return (
    <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="w-full max-w-2xl">
        <AccountSettingsForm />
      </div>
    </div>
  )
}
