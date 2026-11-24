import axios from "axios"

export const getHouseholdExpenses = async (householdId) => {
  const { data } = await axios.get(`/api/households/${householdId}/expenses`)
  return data
}

export const createRecurringBill = async (householdId, form) => {
  try {
    const { data } = await axios.post(
      `/api/households/${householdId}/recurring-bills`,
      form,
    )

    return data
  } catch (error) {
    if (error.response?.status === 400) {
      return { errors: error.response.data.errors }
    }

    if (error.response?.data?.error) {
      return { error: error.response.data.error }
    }

    throw error
  }
}

export const settleExpense = async (householdId, expenseId, memberId) => {
  try {
    const { data } = await axios.post(
      `/api/households/${householdId}/expenses/${expenseId}/settlements`,
      { memberId },
    )

    return data
  } catch (error) {
    if (error.response?.data?.error) {
      return { error: error.response.data.error }
    }

    throw error
  }
}