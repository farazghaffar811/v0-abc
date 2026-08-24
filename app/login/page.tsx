import LoginForm from "./LoginForm"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col justify-between p-6">
      <LoginForm />
      <footer className="mt-auto text-center text-sm text-gray-500 space-y-1 py-4">
        <div>Coinbase Technology</div>
        <div>All Rights Reserved</div>
        <div>©2015-2025</div>
      </footer>
    </div>
  )
}
