import {RouteProp} from '@react-navigation/native';
import type {
  NativeStackNavigationProp,
  // NativeStackScreenProps,
} from '@react-navigation/native-stack';

export type RootStackParamList = {
  Overview: undefined;
  Transaction: undefined;
  Stats: undefined;
  Menu: undefined;
  ExpenseGraphs: undefined;
  Accounts: {
    account: string;
  };
  AccountsItem: undefined;
  AddExpenses: {
    amount: string;
  };
  Settings: undefined;
  AddDetails: {
    amount: string;
    category?: string;
    account?: string;
  };
  ExpenseTab: {
    fromDate: string;
    toDate: string;
  };
  IncomeTab: {
    fromDate: string;
    toDate: string;
  };
  SpendingTab: {
    fromDate: string;
    toDate: string;
  };
};

//------------------------------------------------------------------------
//---------------------------Screen Type------------------------------------
// export type OverviewPropsType = NativeStackScreenProps<
//   RootStackParamList,
//   'Overview'
// >;

//------------------------------------------------------------------------
//---------------------------Navigation Type---------------------------------
export type OverviewNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Overview'
>;

export type TransactionNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Transaction'
>;

export type StatsNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Stats'
>;

export type AccountsItemNavigationType = NativeStackNavigationProp<
  RootStackParamList,
  'AccountsItem'
>;

export type SettingsItemNavigationType = NativeStackNavigationProp<
  RootStackParamList,
  'Settings'
>;

export type AddDetailsNavigationType = NativeStackNavigationProp<
  RootStackParamList,
  'AddDetails'
>;

export type AccountNavigationType = NativeStackNavigationProp<
  RootStackParamList,
  'Accounts'
>;

export type ExpenseTabNavigationType = NativeStackNavigationProp<
  RootStackParamList,
  'ExpenseTab'
>;

export type IncomeTabTabNavigationType = NativeStackNavigationProp<
  RootStackParamList,
  'IncomeTab'
>;

export type SpendingTabTabNavigationType = NativeStackNavigationProp<
  RootStackParamList,
  'SpendingTab'
>;

//------------------------------------------------------------------------
//---------------------------Route Type------------------------------------

export type AddDetailsRouteProp = RouteProp<RootStackParamList, 'AddDetails'>;

export type AddExpensesRouteProp = RouteProp<RootStackParamList, 'AddExpenses'>;

export type StatsRouteProp = RouteProp<RootStackParamList, 'Stats'>;

export type AccountsRouteProp = RouteProp<RootStackParamList, 'Accounts'>;
export type AccountsItemRouteProp = RouteProp<
  RootStackParamList,
  'AccountsItem'
>;

export type ExpenseTabRouteProp = RouteProp<RootStackParamList, 'ExpenseTab'>;

export type IncomeTabRouteProp = RouteProp<RootStackParamList, 'IncomeTab'>;

export type SpendingTabRouteProp = RouteProp<RootStackParamList, 'SpendingTab'>;
