import React from 'react';
import {createDrawerNavigator} from '@react-navigation/drawer';

import OverviewScreen from '../../../screens/OverviewScreen';
import StatsScreen from '../../../screens/StatsScreen';
import TransactionsScreen from '../../../screens/TransactionsScreen';
import AccountsScreen from '../../../screens/AccountsScreen';
import SettingsScreen from '../../../screens/SettingsScreen';
import DrawerContent from '../../../screens/drawer/DrawerContent';
import ReportsScreen from '../../../screens/ReportsScreen';
import {RootStackParamList} from '../../../types';

const Drawer = createDrawerNavigator<RootStackParamList>();

const MenuDrawer = () => {
  return (
    <Drawer.Navigator
      screenOptions={() => ({
        headerTintColor: 'black',
        drawerType: 'front',
        drawerStyle: {
          backgroundColor: 'lightgrey',
          width: 240,
        },
      })}
      drawerContent={props => <DrawerContent {...props} />}>
      <Drawer.Screen
        name="Overview"
        component={OverviewScreen}
        options={() => ({
          // title: 'Overview',
        })}
      />
      <Drawer.Screen
        name="Transactions"
        component={TransactionsScreen}
        options={() => ({
          title: 'Expenses',
        })}
      />
      <Drawer.Screen
        name="Stats"
        component={StatsScreen}
        options={() => ({
          title: 'Stats',
        })}
      />
      <Drawer.Screen
        name="Accounts"
        component={AccountsScreen}
        options={() => ({
          title: 'Budgets',
        })}
      />
      <Drawer.Screen
        name="Reports"
        component={ReportsScreen}
        options={() => ({
          title: 'Reports',
        })}
      />
      <Drawer.Screen
        name="Settings"
        component={SettingsScreen}
        options={() => ({
          title: 'Settings',
        })}
      />
      {/* <Drawer.Screen
        name="Profile"
        component={ProfileScreen}
        options={({navigation}) => ({
          title: 'Profile',
        })}
      /> */}
    </Drawer.Navigator>
  );
};

export default MenuDrawer;