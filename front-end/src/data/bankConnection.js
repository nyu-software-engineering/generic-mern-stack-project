import { request } from './api.js'

// Check whether the bank is connected.
export async function isBankConnected() {
  const connection = await request('/bank-connection')
  return connection.connected
}

// Connect to the demo bank.
export function saveBankConnection() {
  return request('/bank-connection', { method: 'POST' })
}

// Disconnect from the demo bank.
export function clearBankConnection() {
  return request('/bank-connection', {
    method: 'POST',
    body: { connected: false },
  })
}