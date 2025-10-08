import { db } from "@/lib/firebase"
import { collection, doc, setDoc, serverTimestamp } from "firebase/firestore"

export interface DigitalWallet {
  id?: string
  userId: string
  currency: string
  currencySymbol: string
  classification: string
  address: string
  comment?: string
  createdAt?: Date
  updatedAt?: Date
}

export async function createDigitalWallet(userId: string, walletData: Omit<DigitalWallet, "id" | "userId">) {
  try {
    // Reference to the user's digital wallets subcollection
    const walletsRef = collection(db, "users", userId, "digitalWallets")

    // Generate a new document ID
    const newWalletRef = doc(walletsRef)

    // Prepare the wallet data with timestamps
    const walletWithTimestamps = {
      ...walletData,
      id: newWalletRef.id,
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }

    // Set the document data
    await setDoc(newWalletRef, walletWithTimestamps)

    console.log("Digital wallet created with ID:", newWalletRef.id)
    return newWalletRef.id
  } catch (error) {
    console.error("Error creating digital wallet:", error)
    throw error
  }
}

// Add Bank Wallet types and functions to existing file
export interface BankWallet {
  id?: string
  userId: string
  holderName: string
  bankName: string
  accountNumber: string
  ifscCode: string
  createdAt?: Date
  updatedAt?: Date
}

export async function createBankWallet(userId: string, walletData: Omit<BankWallet, "id" | "userId">) {
  try {
    // Reference to the user's bank wallets subcollection
    const walletsRef = collection(db, "users", userId, "bankWallets")

    // Generate a new document ID
    const newWalletRef = doc(walletsRef)

    // Prepare the wallet data with timestamps
    const walletWithTimestamps = {
      ...walletData,
      id: newWalletRef.id,
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }

    // Set the document data
    await setDoc(newWalletRef, walletWithTimestamps)

    console.log("Bank wallet created with ID:", newWalletRef.id)
    return newWalletRef.id
  } catch (error) {
    console.error("Error creating bank wallet:", error)
    throw error
  }
}
