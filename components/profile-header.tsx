import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function ProfileHeader() {
  return (
    <div className="p-4 flex items-center space-x-4">
      <Avatar className="h-20 w-20">
        <AvatarImage src="/placeholder-avatar.jpg" alt="User" />
        <AvatarFallback>UN</AvatarFallback>
      </Avatar>
      <div>
        <h2 className="text-2xl font-bold">User Name</h2>
        <p className="text-gray-500">user@example.com</p>
      </div>
    </div>
  )
}
