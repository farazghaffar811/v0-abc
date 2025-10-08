import { addDoc, collection, query, getDocs, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"

export async function createDepositRequest(userId: string, userEmail: string, amount: number) {
  try {
    const depositRequestRef = await addDoc(collection(db, "depositRequests"), {
      userId,
      userEmail,
      amount,
      status: "pending",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    console.log("Deposit request created with ID: ", depositRequestRef.id)
    return depositRequestRef.id
  } catch (error) {
    console.error("Error creating deposit request: ", error)
    throw error
  }
}

export async function getDepositRequests() {
  try {
    const q = query(collection(db, "depositRequests"))
    const querySnapshot = await getDocs(q)
    const depositRequests = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }))
    return depositRequests
  } catch (error) {
    console.error("Error fetching deposit requests: ", error)
    throw error
  }
}
