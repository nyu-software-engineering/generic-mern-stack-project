const bankConnectionKey = 'leverage-bank-connected'

// Check whether this browser remembers the connection.
export function isBankConnected() {
  return window.localStorage.getItem(bankConnectionKey) === 'true'
}

// Save the demo connection after the button is clicked.
export function saveBankConnection() {
  window.localStorage.setItem(bankConnectionKey, 'true')
}

// Clear it so the flow can be tried again.
export function clearBankConnection() {
  window.localStorage.removeItem(bankConnectionKey)
}