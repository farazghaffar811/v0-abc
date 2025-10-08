import { adminDb } from "@/lib/firebase-admin"
import { FieldValue } from "firebase-admin/firestore"

async function setupFirestoreCollections() {
  try {
    console.log("Setting up Firestore collections...")

    // Create sample users
    const usersRef = adminDb.collection("users")

    // Sample user 1
    await usersRef.doc("user1").set({
      email: "john.doe@example.com",
      displayName: "John Doe",
      phoneNumber: "+1234567890",
      address: "123 Main St, City, State",
      balance: 1500.5,
      realBalance: 1500.5,
      frozenAmount: 100.0,
      creditScore: 750,
      status: "active",
      withdrawalStatus: "allowed",
      withdrawalProhibited: false,
      isFrozen: false,
      ban: "none",
      reputation: 85,
      referralCode: "JOHN123",
      referralCount: 3,
      referredBy: "",
      isAdmin: false,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    })

    // Sample user 2
    await usersRef.doc("user2").set({
      email: "jane.smith@example.com",
      displayName: "Jane Smith",
      phoneNumber: "+1987654321",
      address: "456 Oak Ave, Town, State",
      balance: 2750.25,
      realBalance: 2750.25,
      frozenAmount: 0.0,
      creditScore: 820,
      status: "active",
      withdrawalStatus: "allowed",
      withdrawalProhibited: false,
      isFrozen: false,
      ban: "none",
      reputation: 92,
      referralCode: "JANE456",
      referralCount: 7,
      referredBy: "JOHN123",
      isAdmin: false,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    })

    // Sample user 3 - Suspended user
    await usersRef.doc("user3").set({
      email: "bob.wilson@example.com",
      displayName: "Bob Wilson",
      phoneNumber: "+1555123456",
      address: "789 Pine St, Village, State",
      balance: 500.0,
      realBalance: 500.0,
      frozenAmount: 500.0,
      creditScore: 450,
      status: "suspended",
      withdrawalStatus: "prohibited",
      withdrawalProhibited: true,
      isFrozen: true,
      ban: "temporary",
      reputation: 25,
      referralCode: "BOB789",
      referralCount: 0,
      referredBy: "",
      isAdmin: false,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    })

    // Admin user
    await usersRef.doc("admin").set({
      email: "admin@supercoin.com",
      displayName: "System Administrator",
      phoneNumber: "+1000000000",
      address: "Admin Office",
      balance: 0.0,
      realBalance: 0.0,
      frozenAmount: 0.0,
      creditScore: 1000,
      status: "active",
      withdrawalStatus: "allowed",
      withdrawalProhibited: false,
      isFrozen: false,
      ban: "none",
      reputation: 100,
      referralCode: "ADMIN",
      referralCount: 0,
      referredBy: "",
      isAdmin: true,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    })

    // Create sample orders
    const ordersRef = adminDb.collection("orders")
    await ordersRef.add({
      userId: "user1",
      symbol: "BTC/USD",
      type: "buy",
      amount: 0.5,
      price: 45000,
      status: "completed",
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    })

    await ordersRef.add({
      userId: "user2",
      symbol: "ETH/USD",
      type: "sell",
      amount: 2.0,
      price: 3200,
      status: "pending",
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    })

    // Create sample transactions
    const transactionsRef = adminDb.collection("transactions")
    await transactionsRef.add({
      userId: "user1",
      type: "deposit",
      amount: 1000,
      status: "completed",
      description: "Bank deposit",
      createdAt: FieldValue.serverTimestamp(),
    })

    await transactionsRef.add({
      userId: "user2",
      type: "withdrawal",
      amount: 500,
      status: "pending",
      description: "Bank withdrawal",
      createdAt: FieldValue.serverTimestamp(),
    })

    // Create sample withdrawals
    const withdrawalsRef = adminDb.collection("withdrawals")
    await withdrawalsRef.add({
      userId: "user1",
      amount: 500,
      method: "bank",
      bankDetails: {
        accountNumber: "1234567890",
        routingNumber: "987654321",
        bankName: "Example Bank",
      },
      status: "pending",
      createdAt: FieldValue.serverTimestamp(),
    })

    // Create sample deposit requests
    const depositRequestsRef = adminDb.collection("depositRequests")
    await depositRequestsRef.add({
      userId: "user2",
      amount: 1000,
      method: "bank",
      status: "approved",
      createdAt: FieldValue.serverTimestamp(),
      processedAt: FieldValue.serverTimestamp(),
    })

    // Create sample notifications
    const notificationsRef = adminDb.collection("notifications")
    await notificationsRef.add({
      userId: "user1",
      title: "Deposit Confirmed",
      message: "Your deposit of $1000 has been confirmed",
      type: "success",
      isRead: false,
      createdAt: FieldValue.serverTimestamp(),
    })

    // Create sample invitations
    const invitationsRef = adminDb.collection("invitations")
    await invitationsRef.add({
      code: "WELCOME2024",
      isUsed: false,
      createdAt: FieldValue.serverTimestamp(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    })

    // Create user subcollections
    // User wallets
    await usersRef.doc("user1").collection("wallets").doc("btc").set({
      symbol: "BTC",
      address: "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
      balance: 0.5,
      createdAt: FieldValue.serverTimestamp(),
    })

    await usersRef.doc("user1").collection("wallets").doc("eth").set({
      symbol: "ETH",
      address: "0x742d35Cc6634C0532925a3b8D4C9db96590b5c8e",
      balance: 2.0,
      createdAt: FieldValue.serverTimestamp(),
    })

    // User transactions
    await usersRef.doc("user1").collection("transactions").add({
      type: "deposit",
      amount: 1000,
      status: "completed",
      description: "Initial deposit",
      createdAt: FieldValue.serverTimestamp(),
    })

    // User notifications
    await usersRef.doc("user1").collection("notifications").add({
      title: "Welcome!",
      message: "Welcome to SuperCoin platform",
      type: "info",
      isRead: false,
      createdAt: FieldValue.serverTimestamp(),
    })

    console.log("✅ Firestore collections setup completed successfully!")
    console.log("📊 Created collections:")
    console.log("  - users (4 sample users including admin)")
    console.log("  - orders (2 sample orders)")
    console.log("  - transactions (2 sample transactions)")
    console.log("  - withdrawals (1 sample withdrawal)")
    console.log("  - depositRequests (1 sample deposit request)")
    console.log("  - notifications (1 sample notification)")
    console.log("  - invitations (1 sample invitation)")
    console.log("  - user subcollections (wallets, transactions, notifications)")
  } catch (error) {
    console.error("❌ Error setting up Firestore collections:", error)
    throw error
  }
}

// Run the setup if this file is executed directly
if (require.main === module) {
  setupFirestoreCollections()
    .then(() => {
      console.log("Setup completed!")
      process.exit(0)
    })
    .catch((error) => {
      console.error("Setup failed:", error)
      process.exit(1)
    })
}

export { setupFirestoreCollections }
