import AsyncStorage from '@react-native-async-storage/async-storage';

import {ExpenseCategory} from '../dummy/categoryItems';
import {expenseCategoriesActions} from './expense-category-slice';

export const fetchExpenseCategoriesData = () => {
  return async dispatch => {
    const fetchData = async () => {
      //   const response = await AsyncStorage.getItem('root');
      const response = ExpenseCategory; // to load provisioned account category.

      // return response !== null ? JSON.stringify(response) : null;
      return response !== null ? response : null;
    };

    try {
      const ExpenseCategoriesData = await fetchData();
      dispatch(
        expenseCategoriesActions.replaceExpenseCategories({
          expenseCategories: ExpenseCategoriesData || [],
        }),
      );
    } catch (error) {}
  };
};

/* Redux-persist will automatically retrieve data from AsyncStorage 
 ,so don't have to do the same as Amplify*/
