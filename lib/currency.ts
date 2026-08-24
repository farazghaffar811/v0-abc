export type Currency = "INR" | "USD"

export const DEFAULT_CURRENCY: Currency = "INR"
export const FALLBACK_INR_PER_USD = 83.5

export function convertFromINR(amountINR: number, currency: Currency, inrPerUsd = FALLBACK_INR_PER_USD) {
  return currency === "USD" ? amountINR / inrPerUsd : amountINR
}

export function convertToINR(amount: number, currency: Currency, inrPerUsd = FALLBACK_INR_PER_USD) {
  return currency === "USD" ? amount * inrPerUsd : amount
}

export function currencySymbol(currency: Currency) {
  return currency === "USD" ? "$" : "₹"
}

export function formatCurrency(amountINR: number, currency: Currency = DEFAULT_CURRENCY, inrPerUsd = FALLBACK_INR_PER_USD) {
  const amount = convertFromINR(amountINR || 0, currency, inrPerUsd)
  return `${currencySymbol(currency)}${amount.toLocaleString(currency === "USD" ? "en-US" : "en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export async function fetchExchangeRate(): Promise<number> {
  try {
    const response = await fetch("https://api.frankfurter.app/latest?from=USD&to=INR", { cache: "no-store" })
    if (!response.ok) throw new Error("Rate request failed")
    const data = await response.json()
    return typeof data?.rates?.INR === "number" ? data.rates.INR : FALLBACK_INR_PER_USD
  } catch {
    return FALLBACK_INR_PER_USD
  }
}
