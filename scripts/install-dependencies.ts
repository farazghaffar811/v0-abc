import { execSync } from "child_process"

console.log("Installing new dependencies...")

try {
  execSync("npm install clsx tailwind-merge", { stdio: "inherit" })
  console.log("Dependencies installed successfully!")
} catch (error) {
  console.error("Error installing dependencies:", error)
  process.exit(1)
}
