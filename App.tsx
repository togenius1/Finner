import {
  ActivityIndicator,
  Appearance,
  LogBox,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {setPRNG} from 'tweetnacl';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Amplify, Auth, DataStore, Hub} from 'aws-amplify';
import {BannerAd, BannerAdSize, TestIds} from 'react-native-google-mobile-ads';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import {generateKeyPair, PRIVATE_KEY, PRNG, PUBLIC_KEY} from './util/crypto';
import FinnerNavigator from './navigation/FinnerNavigator';
import {useAppDispatch, useAppSelector} from './hooks';
import {fetchCashAccountsData} from './store/cash-action';
import {fetchAccountsData} from './store/account-action';
import {fetchIncomeCategoriesData} from './store/income-category-action';
import {fetchExpenseCategoriesData} from './store/expense-category-action';
// import {fetchExpensesData} from './store/expense-action';
// import {fetchIncomesData} from './store/income-action';
// import {fetchDailyTransactsData} from './store/dailyTransact-action';
// import {fetchMonthlyTransactsData} from './store/monthlyTransact-action';
// import {fetchWeeklyTransactsData} from './store/weeklyTransact-action';
import awsconfig from './src/aws-exports';
import {LazyUser, User} from './src/models';
import {authAccountsActions} from './store/authAccount-slice';
import moment from 'moment';

Amplify.configure(awsconfig);

setPRNG(PRNG);

const adUnitId = __DEV__
  ? TestIds.BANNER
  : 'ca-app-pub-3212728042764573~3355076099';

const App = () => {
  // Disable warnings for release app.
  // LogBox.ignoreLogs(['Warning: ...']); // Ignore log notification by message:
  // LogBox.ignoreAllLogs(); // Ignore all log notifications:

  const dispatch = useAppDispatch();
  const dataLoaded = useAppSelector(store => store);

  const authAccounts = dataLoaded?.authAccounts?.authAccounts;

  const expenseCateData = useAppSelector(
    state => state.expenseCategories.expenseCategories,
    // shallowEqual,
  );
  const incomesCateData = useAppSelector(
    state => state.incomeCategories.incomeCategories,
    // shallowEqual,
  );
  const cashData = useAppSelector(
    state => state.cashAccounts.cashAccounts,
    // shallowEqual,
  );
  const accountsData = useAppSelector(
    state => state.accounts.accounts,
    // shallowEqual,
  );

  // const [currentUser, setCurrentUser] = useState<LazyUser[]>([]);
  const [authedUser, setAuthedtUser] = useState<any>();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>();
  // const [cloudPrivateKey, setCloudPrivateKey] = useState<string | null>('');
  const [closedAds, setClosedAds] = useState<boolean>(false);
  // const [localPrivateKey, setLocalPrivateKey] = useState<string | null>();
  const [showIndicator, setShowIndicator] = useState<boolean>(false);

  //Reset Expense
  // useEffect(() => {
  //   dispatch(fetchCashAccountsData());
  //   dispatch(fetchExpensesData());
  //   dispatch(fetchIncomesData());
  //   dispatch(fetchMonthlyTransactsData());
  //   dispatch(fetchWeeklyTransactsData());
  //   dispatch(fetchDailyTransactsData());
  // }, []);

  // Load Existing Category
  // useEffect(() => {

  // }, []);

  // Check if authenticated user, Stay logged in.
  useEffect(() => {
    const isAuthenticated = async () => {
      // const authUser = await Auth.currentAuthenticatedUser({bypassCache: true});
      const authUser = await Auth.currentAuthenticatedUser();
      // setAuthedtUser(authUser);

      setIsAuthenticated(true);
    };

    isAuthenticated();
  }, []);

  // Listening for Login events.
  useEffect(() => {
    const listenerAuth = async data => {
      if (data.payload.event === 'signIn') {
        // Load Existing Category
        if (expenseCateData.length === 0) {
          dispatch(fetchExpenseCategoriesData());
        }
        if (incomesCateData.length === 0) {
          dispatch(fetchIncomeCategoriesData());
        }
        if (cashData.length === 0) {
          dispatch(fetchCashAccountsData());
        }
        if (accountsData.length === 0) {
          dispatch(fetchAccountsData());
        }

        // await generateNewKey();

        setIsAuthenticated(true);
      }
      if (data.payload.event === 'signOut') {
        setIsAuthenticated(false);
      }
    };

    Hub.listen('auth', listenerAuth);
  }, []);

  // useEffect(() => {
  //   // Create listener
  //   const listener = Hub.listen('datastore', async hubData => {
  //     const {event, data} = hubData.payload;
  //     if (event === 'ready') {
  //       // do something here once the data is synced from the cloud
  //       await generateNewKey();
  //     }
  //   });

  //   // Remove listener
  //   listener();
  // }, []);

  // Check if authenticated user.
  const checkUserAndGenerateNewKey = async () => {
    // setShowIndicator(true);

    // const authUser = await Auth.currentAuthenticatedUser({bypassCache: true});
    const authedUser = await Auth.currentAuthenticatedUser();
    const subId: string = authedUser?.attributes?.sub;
    const dbCurrentUser = await DataStore.query(User, c => c.id.eq(subId));

    const name = String(dbCurrentUser[0]?.name);
    const cloudPKey = dbCurrentUser[0]?.backupKey;

    const key = cloudPKey === undefined ? null : cloudPKey;

    console.log('subId--: ', subId);
    console.log('dbCurrentUser: ', dbCurrentUser);

    if (dbCurrentUser.length === 0) {
      return;
    }

    // await generateNewKey(subId, name, String(key), dbCurrentUser);
  };

  // Generate new key
  const generateNewKey = async () =>
    // id: string,
    // name: string,
    // pKey: string,
    // dbUser: LazyUser[],
    {
      setShowIndicator(true);
      const authedUser = await Auth.currentAuthenticatedUser();
      const subId: string = authedUser?.attributes?.sub;
      const dbCurrentUser = await DataStore.query(User, c => c.id.eq(subId));
      setShowIndicator(false);

      const name = String(dbCurrentUser[0]?.name);
      const cloudPKey = dbCurrentUser[0]?.backupKey;

      const pKey = cloudPKey === undefined ? null : cloudPKey;

      console.log('subId: ', subId);
      console.log('dbCurrentUser: ', dbCurrentUser);
      console.log('pKey: ', pKey);

      if (dbCurrentUser.length === 0) {
        return;
      }

      // Compare Cloud key with local key
      if (pKey === null) {
        console.log('+++++++++++++++++ Generating new Key +++++++++++++++++');
        // Generate a new backup key.
        const {publicKey, secretKey} = generateKeyPair();

        // Save the new key to the cloud
        await DataStore.save(
          User.copyOf(dbCurrentUser[0], updated => {
            updated.backupKey = String(secretKey);
          }),
        );

        // Save Key to local storage.
        // await AsyncStorage.setItem(PRIVATE_KEY, secretKey.toString());
        // await AsyncStorage.setItem(PUBLIC_KEY, publicKey.toString());

        // Check if this account isEmpty
        const existingAccount = authAccounts?.filter(
          account => account?.id === id,
        );
        if (existingAccount?.length === 0) {
          dispatch(
            authAccountsActions.addAuthAccount({
              id: subId,
              name: name,
              backupKey: secretKey.toString(),
              publicKey: publicKey.toString(),
              keyCreatedDate: moment().date(),
            }),
          );
        }
      }
      // setShowIndicator(false);
    };

  // Load Key from Cloud
  // const saveCloudKeyToLocal = async () => {
  //   await AsyncStorage.removeItem(PRIVATE_KEY);
  //   await AsyncStorage.removeItem(PUBLIC_KEY);

  //   await AsyncStorage.setItem(PRIVATE_KEY, String(cloudPrivateKey));
  //   const newPublicKey = generatePublicKeyFromSecretKey(
  //     stringToUint8Array(String(cloudPrivateKey)),
  //   );
  //   await AsyncStorage.setItem(PUBLIC_KEY, newPublicKey.publicKey.toString());
  // };

  // const removeCloudKey = async () => {
  //   const originalUser = await DataStore.query(User, String(user?.id));
  //   await DataStore.save(
  //     User.copyOf(originalUser, updated => {
  //       updated.backupKey = null;
  //     }),
  //   );
  // };

  const closeAdsHandler = () => {
    setClosedAds(true);
  };

  const colorScheme = Appearance.getColorScheme();

  return (
    <>
      <StatusBar barStyle="light-content" />
      <ActivityIndicator
        size="small"
        color="#0000ff"
        animating={showIndicator}
      />
      <FinnerNavigator
        isAuthenticated={isAuthenticated}
        colorScheme={colorScheme}
      />

      {isAuthenticated && !closedAds && (
        <>
          <Pressable
            style={({pressed}) => pressed && styles.pressed}
            onPress={() => closeAdsHandler()}>
            <View style={styles.close}>
              <MaterialCommunityIcons name="close" size={20} color={'grey'} />
            </View>
          </Pressable>

          <BannerAd
            unitId={adUnitId}
            size={BannerAdSize.BANNER}
            requestOptions={{
              requestNonPersonalizedAdsOnly: true,
            }}
          />
        </>
      )}

      {/* {currentUser && (
        <>
          <CButton onPress={removeCloudKey} style={{bottom: 25}}>
            Remove Cloud Key
          </CButton>
        </>
      )} */}
    </>
  );
};

export default App;

//========== Style sheet =======================================
const styles = StyleSheet.create({
  close: {
    position: 'absolute',
    right: 15,
  },
  pressed: {
    opacity: 0.65,
  },
});

// =================================
