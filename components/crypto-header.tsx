import Image from "next/image"

export function CryptoHeader({ balance }: { balance: string }) {
  return (
    <div className="flex items-center justify-between p-4 bg-white text-gray-800">
      <div className="w-8 h-8 rounded-full overflow-hidden">
        <Image
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/design-mode-images/profile.jpg%281%29%281%29-Wwid3uAeo3KSujAwDTxiPiK2DaniRU.jpeg"
          alt="Profile"
          width={32}
          height={32}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="text-sm">Balance: {balance}</div>
    </div>
  )
}
