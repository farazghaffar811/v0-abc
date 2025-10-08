import { db } from "../lib/firebase"
import { collection, getDocs, writeBatch, doc } from "firebase/firestore"

interface UpdateFields {
  [key: string]: any
}

async function updateUserSubcollections(subcollectionName: string, defaultFields: UpdateFields) {
  const usersRef = collection(db, "users")
  const userSnapshot = await getDocs(usersRef)

  for (const userDoc of userSnapshot.docs) {
    const userId = userDoc.id
    const subcollectionRef = collection(db, "users", userId, subcollectionName)
    const subcollectionSnapshot = await getDocs(subcollectionRef)

    const batch = writeBatch(db)

    for (const subDoc of subcollectionSnapshot.docs) {
      const subDocRef = doc(db, "users", userId, subcollectionName, subDoc.id)
      const subDocData = subDoc.data()

      const updates: UpdateFields = {}
      for (const [key, value] of Object.entries(defaultFields)) {
        if (subDocData[key] === undefined) {
          updates[key] = value
        }
      }

      if (Object.keys(updates).length > 0) {
        batch.update(subDocRef, updates)
      }
    }

    await batch.commit()
    console.log(`Updated subcollection ${subcollectionName} for user ${userId}`)
  }

  console.log(`Finished updating ${subcollectionName} for all users`)
}

// Example usage
const defaultFields = {
  newField1: "defaultValue1",
  newField2: 0,
  // Add more fields as needed
}

updateUserSubcollections("yourSubcollectionName", defaultFields)
  .then(() => console.log("Update completed successfully"))
  .catch((error) => console.error("Error updating subcollections:", error))
