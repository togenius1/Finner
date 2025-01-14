import AsyncStorage from '@react-native-async-storage/async-storage';

import {AccountCategory} from '../dummy/account';
import {accountActions} from './account-slice';

export const fetchAccountsData = () => {
  return async dispatch => {
    const fetchData = async () => {
      //   const response = await AsyncStorage.getItem('root');
      const response = AccountCategory; // to load provisioned account category.
      // await AsyncStorage.removeItem('root');
      // const response = null;

      // return response !== null ? JSON.stringify(response) : null;
      return response !== null ? response : null;
    };

    try {
      const AccountsData = await fetchData();
      dispatch(
        accountActions.replaceAccount({
          accounts: AccountsData || [],
        }),
      );
    } catch (error) {}
  };
};

/* Redux-persist will automatically retrieve data from AsyncStorage 
 ,so don't have to do the same as Amplify*/
