"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { collection, query as fsQuery, getDocs, orderBy, addDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { UserEditDialog } from "@/components/user-edit-dialog"
import type { UserProfile } from "@/lib/types"
import { getAuth } from "firebase/auth"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { MessageSquare, Search, X } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

export default function DashboardContent() {
  const [allUsers, setAllUsers] = useState<UserProfile[]>([])
  const [users, setUsers] = useState<UserProfile[]>([])
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const initialSearch = (searchParams.get("search") || "").trim()

  const [searchTerm, setSearchTerm] = useState(initialSearch)

  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false)
  const [selectedUserEmail, setSelectedUserEmail] = useState<string | null>(null)
  const [resetSuccess, setResetSuccess] = useState<boolean | null>(null)
  const auth = getAuth()

  // Announcement dialog state
  const [isAnnouncementDialogOpen, setIsAnnouncementDialogOpen] = useState(false)
  const [announcementMessage, setAnnouncementMessage] = useState("")
  const [announcementUser, setAnnouncementUser] = useState<UserProfile | null>(null)
  const [isSendingAnnouncement, setIsSendingAnnouncement] = useState(false)

  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordError, setPasswordError] = useState<string | null>(null)

  // Small helper to format dates
  const formatDateTime = (date: Date | string | null | undefined) => {
    if (!date) return "-"
    const d = typeof date === "string" ? new Date(date) : date
    try {
      return new Intl.DateTimeFormat("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(d as Date)
    } catch {
      return d ? (d as Date).toString() : "-"
    }
  }

  // Fetch once, then filter client-side so partial search works for any letters
  const fetchUsers = async () => {
    setIsLoading(true)
    try {
      const usersBase = collection(db, "users")
      const q = fsQuery(usersBase, orderBy("createdAt", "desc"))
      const snap = await getDocs(q)
      const list = snap.docs.map((d) => {
        const data = d.data()
        return {
          uid: d.id,
          email: data.email || "",
          displayName: data.displayName || "",
          balance: data.balance || 0,
          realBalance: data.realBalance || 0,
          frozenAmount: data.frozenAmount || 0,
          creditScore: data.creditScore || 100,
          status: data.status || "active",
          withdrawalStatus: data.withdrawalStatus || "allowed",
          withdrawalProhibited: data.withdrawalProhibited || false,
          isFrozen: data.isFrozen || false,
          ban: data.ban || "none",
          reputation: data.reputation || 0,
          referralCode: data.referralCode || "",
          referralCount: data.referralCount || 0,
          referredBy: data.referredBy || "",
          phoneNumber: data.phoneNumber || "",
          address: data.address || "",
          isAdmin: data.isAdmin || false,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as UserProfile
      })

      // Filter out the old admin email
      const filtered = list.filter((u) => u.email !== "admin@ucoin.com")
      setAllUsers(filtered)
    } catch (error) {
      console.error("Error fetching users:", error)
      toast({
        title: "Error",
        description: "Failed to fetch users. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Derived filtering (partial match on multiple fields)
  useEffect(() => {
    const term = searchTerm.toLowerCase()
    const next = term
      ? allUsers.filter((u) => {
          const fields = [
            u.email || "",
            u.displayName || "",
            u.uid || "",
            u.phoneNumber || "",
            u.address || "",
            u.referralCode || "",
            u.referredBy || "",
          ]
          return fields.some((f) => f.toLowerCase().includes(term))
        })
      : allUsers
    setUsers(next)
  }, [allUsers, searchTerm])

  // When URL changes elsewhere, keep state in sync
  useEffect(() => {
    const urlTerm = (searchParams.get("search") || "").trim()
    setSearchTerm(urlTerm)
  }, [searchParams])

  const applySearchToUrl = (term: string) => {
    const usp = new URLSearchParams(Array.from(searchParams.entries()))
    if (term) {
      usp.set("search", term)
    } else {
      usp.delete("search")
    }
    router.replace(`${pathname}?${usp.toString()}`)
  }

  const handleSubmitSearch = (e: React.FormEvent) => {
    e.preventDefault()
    applySearchToUrl(searchTerm.trim())
  }

  const handleClearSearch = () => {
    setSearchTerm("")
    applySearchToUrl("")
  }

  const handleEditUser = (user: UserProfile) => {
    setSelectedUser(user)
    setIsEditDialogOpen(true)
  }

  const handleSaveUser = () => {
    setIsEditDialogOpen(false)
    setSelectedUser(null)
    fetchUsers()
  }

  const handleResetPassword = async () => {
    if (!selectedUserEmail || !selectedUser) return

    setPasswordError(null)

    if (!newPassword || newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters long")
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match")
      return
    }

    try {
      const response = await fetch("/api/admin/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uid: selectedUser.uid,
          newPassword,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to update password")
      }

      setResetSuccess(true)
      setNewPassword("")
      setConfirmPassword("")
    } catch (error) {
      console.error("Error updating password:", error)
      setResetSuccess(false)
      setPasswordError(error instanceof Error ? error.message : "Failed to update password")
    }
  }

  const handleOpenAnnouncementDialog = (user: UserProfile) => {
    setAnnouncementUser(user)
    setAnnouncementMessage("")
    setIsAnnouncementDialogOpen(true)
  }

  const handleSendAnnouncement = async () => {
    if (!announcementUser || !announcementMessage.trim()) {
      toast({
        title: "Error",
        description: "Please provide a message to send",
        variant: "destructive",
      })
      return
    }

    setIsSendingAnnouncement(true)

    try {
      const userAnnouncementsRef = collection(db, "users", announcementUser.uid, "announcements")
      await addDoc(userAnnouncementsRef, {
        message: announcementMessage,
        createdAt: serverTimestamp(),
        readAt: null,
        isRead: false,
        fromAdmin: true,
      })

      toast({
        title: "Success",
        description: "Announcement sent successfully",
      })

      setIsAnnouncementDialogOpen(false)
      setAnnouncementMessage("")
    } catch (error) {
      console.error("Error sending announcement:", error)
      toast({
        title: "Error",
        description: "Failed to send announcement",
        variant: "destructive",
      })
    } finally {
      setIsSendingAnnouncement(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-6"></div>
        <div className="border rounded-md">
          <div className="h-10 bg-gray-100 rounded-t-md"></div>
          <div className="space-y-4 p-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex justify-between items-center">
                <div className="h-5 w-32 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-5 w-16 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-5 w-16 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-5 w-16 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-5 w-16 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-8 w-32 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-col gap-3 mb-4 md:flex-row md:items-center md:justify-between">
        <h2 className="text-xl font-semibold">Member List ({users.length} users)</h2>

        {/* Search Bar (partial match on multiple fields) */}
        <form onSubmit={handleSubmitSearch} className="flex w-full max-w-lg items-center gap-2 md:ml-auto">
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by email, name, UID, phone, address, referral..."
            aria-label="Search users"
          />
          <Button type="submit" variant="default" className="whitespace-nowrap">
            <Search className="mr-2 h-4 w-4" />
            Search
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleClearSearch}
            className="whitespace-nowrap bg-transparent"
          >
            <X className="mr-2 h-4 w-4" />
            Clear
          </Button>
        </form>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Real Balance</TableHead>
              <TableHead>Frozen Amount</TableHead>
              <TableHead>Credit Score</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Withdrawal Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow
                key={user.uid}
                className={
                  searchTerm && user.email.toLowerCase().includes(searchTerm.toLowerCase()) ? "bg-yellow-50" : ""
                }
              >
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{user.email}</span>
                    {user.displayName && <span className="text-sm text-gray-500">{user.displayName}</span>}
                  </div>
                  {(user.email === "admin@coinbase.com" || user.isAdmin) && (
                    <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">Admin</span>
                  )}
                </TableCell>
                <TableCell>
                  <span className="font-mono">${(user.realBalance || 0).toFixed(2)}</span>
                </TableCell>
                <TableCell>
                  <span className="font-mono text-red-600">${(user.frozenAmount || 0).toFixed(2)}</span>
                </TableCell>
                <TableCell>
                  <span className="font-semibold">{user.creditScore || 100}</span>
                </TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.status === "active"
                        ? "bg-green-100 text-green-800"
                        : user.status === "suspended"
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {user.status || "active"}
                  </span>
                </TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.withdrawalStatus === "allowed" || !user.withdrawalProhibited
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {user.withdrawalProhibited ? "prohibited" : user.withdrawalStatus || "allowed"}
                  </span>
                </TableCell>
                <TableCell>{formatDateTime(user.createdAt)}</TableCell>
                <TableCell className="flex gap-2">
                  <button
                    onClick={() => handleEditUser(user)}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      setSelectedUserEmail(user.email)
                      setSelectedUser(user)
                      setIsResetDialogOpen(true)
                    }}
                    className="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded text-sm"
                  >
                    Reset Password
                  </button>
                  <button
                    onClick={() => handleOpenAnnouncementDialog(user)}
                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded flex items-center gap-1 text-sm"
                  >
                    <MessageSquare className="h-4 w-4" />
                    Message
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {users.length === 0 && !isLoading && (
        <div className="text-center py-8 text-gray-500">
          {searchTerm ? "No users match your search" : "No users found"}
        </div>
      )}

      <UserEditDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        user={selectedUser}
        onSave={handleSaveUser}
      />

      <AlertDialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset User Password</AlertDialogTitle>
            <AlertDialogDescription>
              {resetSuccess === null ? (
                <>
                  Set a new password for user <strong>{selectedUserEmail}</strong>
                </>
              ) : resetSuccess ? (
                <span className="text-green-600">Password updated successfully!</span>
              ) : (
                <span className="text-red-600">Failed to update password. Please try again.</span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>

          {resetSuccess === null && (
            <div className="py-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                />
              </div>
              {passwordError && <p className="text-sm text-red-500">{passwordError}</p>}
            </div>
          )}

          <AlertDialogFooter>
            {resetSuccess === null ? (
              <>
                <AlertDialogCancel
                  onClick={() => {
                    setSelectedUserEmail(null)
                    setResetSuccess(null)
                    setNewPassword("")
                    setConfirmPassword("")
                    setPasswordError(null)
                  }}
                >
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction onClick={handleResetPassword}>Update Password</AlertDialogAction>
              </>
            ) : (
              <AlertDialogAction
                onClick={() => {
                  setIsResetDialogOpen(false)
                  setSelectedUserEmail(null)
                  setResetSuccess(null)
                  setNewPassword("")
                  setConfirmPassword("")
                  setPasswordError(null)
                }}
              >
                Close
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Announcement Dialog */}
      <Dialog open={isAnnouncementDialogOpen} onOpenChange={setIsAnnouncementDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Send Announcement to {announcementUser?.email}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Write your announcement message here..."
              className="min-h-[150px]"
              value={announcementMessage}
              onChange={(e) => setAnnouncementMessage(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAnnouncementDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendAnnouncement} disabled={isSendingAnnouncement || !announcementMessage.trim()}>
              {isSendingAnnouncement ? "Sending..." : "Send Announcement"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
