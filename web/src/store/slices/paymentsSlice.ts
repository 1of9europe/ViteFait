import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface Payment {
  id: string
  missionId: string
  amount: number
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  method: 'card' | 'bank_transfer' | 'paypal'
  createdAt: string
  updatedAt: string
  transactionId?: string
}

interface PaymentsState {
  payments: Payment[]
  isLoading: boolean
  error: string | null
}

const initialState: PaymentsState = {
  payments: [],
  isLoading: false,
  error: null,
}

const paymentsSlice = createSlice({
  name: 'payments',
  initialState,
  reducers: {
    fetchPaymentsStart: (state) => {
      state.isLoading = true
      state.error = null
    },
    fetchPaymentsSuccess: (state, action: PayloadAction<Payment[]>) => {
      state.isLoading = false
      state.payments = action.payload
    },
    fetchPaymentsFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false
      state.error = action.payload
    },
    addPayment: (state, action: PayloadAction<Payment>) => {
      state.payments.unshift(action.payload)
    },
    updatePaymentStatus: (state, action: PayloadAction<{ id: string; status: Payment['status'] }>) => {
      const payment = state.payments.find(p => p.id === action.payload.id)
      if (payment) {
        payment.status = action.payload.status
      }
    },
  },
})

export const { 
  fetchPaymentsStart, 
  fetchPaymentsSuccess, 
  fetchPaymentsFailure, 
  addPayment,
  updatePaymentStatus 
} = paymentsSlice.actions

export default paymentsSlice.reducer 