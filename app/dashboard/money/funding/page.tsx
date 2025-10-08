import PlatformWalletSettings from "./platform-wallet-settings"

export default function FundingDetailsPage() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Funding Details</h1>
      <p className="mb-6">Manage platform wallet settings and other funding details here.</p>
      <PlatformWalletSettings />
    </div>
  )
}
