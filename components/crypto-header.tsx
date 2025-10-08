import Image from "next/image"

export function CryptoHeader({ balance }: { balance: string }) {
  return (
    <div className="flex items-center justify-between p-4 bg-white text-gray-800">
      <div className="w-8 h-8 rounded-full overflow-hidden">
        <Image
          src="/images/design-mode/profile.jpg%281%29%281%29.jpeg"
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
