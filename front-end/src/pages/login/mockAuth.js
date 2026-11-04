// Temporary stand-in for the back-end login API until Sprint 2.
// Resolves with a user object for the demo account, or null for wrong credentials.
const DEMO_EMAIL = 'demo@splitlease.com'
const DEMO_PASSWORD = 'password123'

export const mockLogin = (email, password) => {
  return new Promise(resolve => {
    setTimeout(() => {
      if (email.trim().toLowerCase() === DEMO_EMAIL && password === DEMO_PASSWORD) {
        resolve({ id: 1, name: 'Demo User', email: DEMO_EMAIL })
      } else {
        resolve(null)
      }
    }, 600)
  })
}
