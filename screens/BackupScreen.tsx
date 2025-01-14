import {
  Alert,
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {prefetchConfiguration} from 'react-native-app-auth';
import DocumentPicker from 'react-native-document-picker';
import RNFS from 'react-native-fs';

import {configs, defaultAuthState} from '../util/authConfig';
import {decryption} from '../util/decrypt';
import {encryption} from '../util/encrypt';
import {
  fetchCreateFile,
  fetchCreateFolder,
  fetchFindFolder,
} from '../util/fetchData';
import {authorization, refreshAuthorize} from '../util/auth';
import {Auth, DataStore} from 'aws-amplify';
import {
  generatePublicKeyFromSecretKey,
  PRIVATE_KEY,
  PUBLIC_KEY,
  stringToUint8Array,
} from '../util/crypto';
import {User} from '../src/models';
import {useAppSelector} from '../hooks';

// Constant
const {width} = Dimensions.get('window');
const sec_1 = 1000;
const minute_1 = sec_1 * 60;
const minute_5 = minute_1 * 5;
const minute_15 = minute_5 * 3;
const hour = minute_15 * 4;
const day = hour * 24;
const SevenDays = day * 7;
const month = day * 30;

// Main
const BackupScreen = () => {
  const [authState, setAuthState] = useState<AuthStateType>(defaultAuthState);
  const [isLoading, setIsLoading] = useState<boolean | undefined>(false);
  const auth = useRef<string | null>('');
  const timerRef = useRef();
  // const [jsonData, setJsonData] = useState<ExpenseType>();

  const dataLoaded = useAppSelector(store => store);
  const jsonData = dataLoaded?.expenses?.expenses;

  console.log('PRIVATE_KEY: ', PRIVATE_KEY);

  useEffect(() => {
    // setJsonData(EXPENSES);
    setUpKey();
  }, []);

  // useEffect(() => {
  //   prefetchConfiguration({
  //     warmAndPrefetchChrome: true,
  //     connectionTimeoutSeconds: 5,
  //     ...configs.auth0,
  //   });
  // }, []);

  // Timer to backup. Should move to the App file?
  useEffect(() => {
    timerRef.current = setInterval(() => {
      // console.log('timer running');
      Alert.alert(
        'Backup data!',
        'Do you want to backup your data now?',
        [
          {
            text: 'Yes',
            onPress: () => backupHandler(jsonData),
            // style: 'cancel',
          },
          // {
          //   text: 'Delete',
          //   // onPress: () => removeAccountHandler(item?.id),
          // },
          {
            text: 'No',
            style: 'cancel',
          },
        ],
        {
          cancelable: true,
          // onDismiss: () =>
          //   Alert.alert(
          //     'This alert was dismissed by tapping outside of the alert dialog.',
          //   ),
        },
      );
      // backupHandler(jsonData);
    }, SevenDays);
    () => clearInterval(timerRef.current);
  }, []);

  useEffect(() => {
    authHandler();
  }, [authState]);

  const authHandler = () => {
    const accessToken = authState?.accessToken;
    const authh = `Bearer ${accessToken}`;
    auth.current = authh;
  };

  const handleAuthorize = useCallback(
    async provider => {
      await authorization(provider, setAuthState);
    },
    [authState],
  );

  const handleRefresh = useCallback(async () => {
    await refreshAuthorize(authState, setAuthState);
  }, [authState]);

  // Backup Alert
  const backupAlert = obj => {
    Alert.alert(
      'Backup data!',
      'Do you want to backup your data now?',
      [
        {
          text: 'Yes',
          onPress: () => backupHandler(obj),
          // style: 'cancel',
        },
        {
          text: 'No',
          style: 'cancel',
        },
      ],
      {
        cancelable: true,
        // onDismiss: () =>
        //   Alert.alert(
        //     'This alert was dismissed by tapping outside of the alert dialog.',
        //   ),
      },
    );
  };

  // Backup
  const backupHandler = async obj => {
    const encrypted = await encryption(obj);

    const d = new Date();
    const mm = d.getMonth() + 1;
    let dd = d.getDate();
    const yy = d.getFullYear();
    const time = d.getTime();
    if (dd < 10) {
      dd = `0${dd}`;
    }
    const fileName = `Finner_backup${dd}${mm}${yy}${time}.bak`;

    const today = new Date();
    const expireAccessToken = new Date(authState.accessTokenExpirationDate);
    if (!authState.hasLoggedInOnce || today === expireAccessToken) {
      await handleAuthorize('auth0');
    } else {
      await handleRefresh();
    }
    await findFolderAndInsertFile(encrypted, fileName);
  };

  // Restore data from google drive
  const restoreHandler = async () => {
    const pickedFile = await handleDocumentSelection();

    const uri = pickedFile?.uri;
    const encryptedData = await RNFS.readFile(uri, 'ascii')
      .then(result => {
        return result;
      })
      .catch(err => {
        console.log(err.message, err.code);
      });

    const decrypted = await decryption(String(encryptedData));
    console.log('decrypted: ', decrypted);
    // return decrypted;
    // Replace data to local storage
  };

  // Create folder
  async function createFolder(fileName: string) {
    const folderObj = await fetchCreateFolder(auth.current, jsonData, fileName);
    return folderObj;
  }

  // Find Folder in the google drive.
  async function FindFolderInGoogleDrive() {
    setIsLoading(true);
    const folders = await fetchFindFolder(auth.current);
    setIsLoading(false);
    return folders;
  }

  // Fin any folders in the local storage.
  async function findFolderAndInsertFile(obj, fileName: string) {
    let folderId: string | null;
    folderId = await AsyncStorage.getItem('@folderbackup_key');
    const folderInDrive = await FindFolderInGoogleDrive();

    const foundFolderId = folderInDrive.files?.find(
      fd => fd.id === folderId,
    )?.id;

    if (folderId === null || foundFolderId === undefined) {
      const folderObj = await createFolder(fileName);
      await AsyncStorage.setItem('@folderbackup_key', folderObj?.id);
    } else {
      await fetchCreateFile(auth.current, obj, folderId, fileName);
    }
  }

  // Select file from Storage
  const handleDocumentSelection = async () => {
    try {
      const response = await DocumentPicker.pickSingle({
        presentationStyle: 'fullScreen',
      });
      // console.log('response: ', response);
      return response;
    } catch (err) {
      console.warn(err);
    }
  };

  const setUpKey = async () => {
    try {
      // const authUser = await Auth.currentAuthenticatedUser({bypassCache: true});
      const authUser = await Auth.currentAuthenticatedUser();
      const subId = String(authUser.attributes.sub);
      const dbUser = await DataStore.query(User, c => c.id.eq(subId));
      // setCurrentUser(dbUser);

      // Remove Old Key
      await AsyncStorage.removeItem(PRIVATE_KEY);
      await AsyncStorage.removeItem(PUBLIC_KEY);

      const cloudPrivateKey = String(dbUser[0]?.backupKey);
      await AsyncStorage.setItem(PRIVATE_KEY, cloudPrivateKey);

      const publicKey = generatePublicKeyFromSecretKey(
        stringToUint8Array(cloudPrivateKey),
      );
      await AsyncStorage.setItem(PUBLIC_KEY, String(publicKey?.publicKey));
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.inner}>
        <View>
          <Text
            style={{
              fontSize: width * 0.058,
              fontWeight: 'bold',
              color: 'black',
            }}>
            Backup and Restore{' '}
            <Text style={{fontSize: 12}}>(Google drive)</Text>
          </Text>
        </View>

        <Pressable
          style={({pressed}) => pressed && styles.pressed}
          onPress={() => backupAlert(jsonData)}>
          <View style={{marginTop: 20}}>
            <Text style={{fontSize: width * 0.048, fontWeight: 'bold'}}>
              Backup
            </Text>
            <Text style={{fontSize: 14}}>
              Backup your data to cloud storage
            </Text>
          </View>
        </Pressable>

        <Pressable
          style={({pressed}) => pressed && styles.pressed}
          onPress={() => restoreHandler()}>
          <View style={{marginTop: 20}}>
            <Text style={{fontSize: width * 0.048, fontWeight: 'bold'}}>
              Restore
            </Text>
            <Text style={{fontSize: 14}}>
              Restore your data from cloud storage
            </Text>
          </View>
        </Pressable>
      </View>
    </View>
  );
};

export default BackupScreen;

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    marginTop: 50,
    width,
    height: 220,
    elevation: 3,
    shadowColor: '#c6c6c6',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.7,
    shadowRadius: 3,
    backgroundColor: 'white',
  },
  inner: {
    marginLeft: 20,
  },
  pressed: {
    opacity: 0.75,
  },
});

// ================================ TYPE Interface =============================================
interface AuthStateType {
  hasLoggedInOnce: boolean;
  provider: string;
  accessToken: string;
  accessTokenExpirationDate: string;
  refreshToken: string;
}
