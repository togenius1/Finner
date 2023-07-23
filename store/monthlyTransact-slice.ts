import {createSlice} from '@reduxjs/toolkit';

// import {Expenses} from '../types';

// Define a type for the slice state

const monthlyTransactsSlice = createSlice({
  name: 'monthlyTransact',
  initialState: {
    monthlyTransacts: [],
  },
  reducers: {
    // Load data from DB to Mobile
    replaceMonthlyTransacts(state, action) {
      // console.log('payload: ', action.payload.monthlyTransacts);
      state.monthlyTransacts = action.payload.monthlyTransacts;
    },

    addMonthlyTransactions(state, action) {
      const newTransact = action.payload;
      const existingItem = state.monthlyTransacts.find(
        transact => transact?.id === newTransact?.id,
        // transact?.id === newTransact.month &&
        // transact?.year === newTransact.year,
      );
      if (!existingItem) {
        state.monthlyTransacts.push({
          id: newTransact.id,
          date: newTransact.date,
          year: newTransact.year,
          month: newTransact.month,
          expense_monthly: newTransact.expense_monthly,
          income_monthly: newTransact.income_monthly,
        });
      }
    },
    deleteMonthlyTransactions(state, action) {
      const id = action.payload;
      const existingItem = state.monthlyTransacts.find(
        transact => transact.id === id,
      );
      if (existingItem) {
        state.monthlyTransacts = state.monthlyTransacts.filter(
          transact => transact.id !== id,
        );
      }
    },
    // Update by month number
    updateMonthlyTransactions(state, action) {
      const updatedTransactIndex = state.monthlyTransacts.findIndex(
        transact => transact.id === action.payload?.id,
        // transact.month === action.payload.month &&
        // transact.year === action.payload.year,
      );
      state.monthlyTransacts[updatedTransactIndex] = action.payload;
    },
  },
});

export const monthlyTransactsActions = monthlyTransactsSlice.actions;

export default monthlyTransactsSlice;
