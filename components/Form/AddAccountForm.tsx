import {
  Dimensions,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {v4 as uuidv4} from 'uuid';
import Ionicons from 'react-native-vector-icons/Ionicons';
// import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import {useAppDispatch, useAppSelector} from '../../hooks';
import {accountActions} from '../../store/account-slice';
import {cashAccountsActions} from '../../store/cash-slice';

type Props = {
  isModalVisible: boolean;
  accountText: string | null;
  addAccPressed: boolean;
  budget: number | undefined;
  isEditAccount: boolean;
  setBudget: (value: number | undefined) => void;
  setIsEditAccount: (value: boolean) => void;
  setAddAccPressed: (value: boolean) => void;
  setIsModalVisible: (value: boolean) => void;
  setAccountText: (value: string | null) => void;
};

const {width, height} = Dimensions.get('window');
const WIDTH = width * 0.9;
const btnAccCashColor = '#ffe9b9';

const AddAccountForm = ({
  isModalVisible,
  setIsModalVisible,
  accountText,
  setAccountText,
  addAccPressed,
  setAddAccPressed,
  budget,
  setBudget,
  isEditAccount,
  setIsEditAccount,
}: Props) => {
  //

  const dispatch = useAppDispatch();
  const dataLoaded = useAppSelector(store => store);

  const accountsData = dataLoaded?.accounts?.accounts;
  const cashData = dataLoaded?.cashAccounts?.cashAccounts;

  // const [budget, setBudget] = useState<number | undefined>(0);
  const [filteredData, setFilteredData] = useState<any[]>();
  // const [addAccPressed, setAddAccPressed] = useState<boolean>(false);
  const [selectedCash, setSelectedCash] = useState<boolean>(false);
  const [savedAcc, setSavedAcc] = useState<boolean>(false);
  const [btnCashColor, setCashBtnColor] = useState<string | undefined>();
  const [btnAccColor, setAccBtnColor] = useState<string | undefined>(
    btnAccCashColor,
  );
  // const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

  useEffect(() => {
    setFilteredData(accountsData);
  }, []);

  useEffect(() => {
    searchFilterHandler(accountText);
  }, [savedAcc]);

  function resetHandler() {
    // Reset State
    setIsModalVisible(false);
    setAddAccPressed(false);
    setSavedAcc(false);
    setBudget(0);
    setAccountText(null);
  }

  function categoryHandler(item) {
    setAccountText(item?.title);
    setAddAccPressed(true);
  }

  function searchFilterHandler(text: string | null) {
    if (text) {
      const newData = accountsData?.filter(item => {
        const itemData = item.title
          ? item.title.toUpperCase()
          : ''.toUpperCase();
        const textData = text.toUpperCase();
        return itemData.indexOf(textData) > -1;
      });
      setFilteredData(newData);
    } else {
      setFilteredData(accountsData);
    }
  }

  const addAccHandler = () => {
    setAddAccPressed(true);
  };

  const saveAccountHandler = () => {
    setSavedAcc(true);
    const findAcc = accountsData?.filter(acc => acc?.title === accountText);
    // add new account
    // if (accountsData?.length === 0 || findAccTitle === -1) {
    if (findAcc?.length === 0) {
      const accId = 'account-' + uuidv4();
      dispatch(
        accountActions.addAccount({
          id: accId,
          title: accountText,
          budget: +budget,
          date: new Date(),
        }),
      );
    } else {
      if (isEditAccount) {
        // Edit account
        dispatch(
          accountActions.updateAccount({
            id: findAcc[0]?.id,
            title: accountText,
            budget: +budget,
            date: new Date(),
          }),
        );
        setIsEditAccount(false);
      } else {
        // Update the account
        dispatch(
          accountActions.updateAccount({
            id: findAcc[0]?.id,
            title: accountText,
            budget: +findAcc[0]?.budget + +budget,
            date: new Date(),
          }),
        );
      }
    }
    resetHandler();
  };

  const saveCashHandler = () => {
    // Create new Cash Account
    if (cashData?.length === 0) {
      const cashId = 'cash1';
      dispatch(
        cashAccountsActions.addCashAccount({
          id: cashId,
          title: 'Cash',
          budget: +budget,
          date: new Date(),
        }),
      );
    } else {
      if (isEditAccount) {
        // Update Cash Account
        dispatch(
          cashAccountsActions.updateCashAccount({
            id: cashData[0]?.id,
            title: 'Cash',
            budget: +budget,
            date: new Date(),
          }),
        );
        setIsEditAccount(false);
      } else {
        // Update Cash Account
        dispatch(
          cashAccountsActions.updateCashAccount({
            id: cashData[0]?.id,
            title: 'Cash',
            budget: +cashData[0]?.budget + +budget,
            date: new Date(),
          }),
        );
      }
    }
    resetHandler();
  };

  const cashBtnPressedHandler = () => {
    setCashBtnColor(btnAccCashColor);
    setAccBtnColor(undefined);
    // Reset
    setSelectedCash(true);
  };

  const accBtnPressedHandler = () => {
    setCashBtnColor(undefined);
    setAccBtnColor(btnAccCashColor);

    // Reset
    setSelectedCash(false);
  };

  const closeHandler = () => {
    // Reset State
    setIsModalVisible(false);
    setAddAccPressed(false);
    setSavedAcc(false);
    setBudget(0);
    setAccountText(null);
  };

  // Render Item
  const renderItem = ({item}) => {
    return (
      // <View>
      <Pressable
        key={item.title + uuidv4()}
        style={({pressed}) => pressed && styles.pressed}
        onPress={() => categoryHandler(item)}>
        <View style={styles.item}>
          <Text>{item.title}</Text>
        </View>
      </Pressable>
      // </View>
    );
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isModalVisible}
      onDismiss={() => setIsModalVisible(false)}
      onRequestClose={() => setIsModalVisible(false)}>
      <Pressable
        style={styles.outSide}
        onPress={() => setIsModalVisible(false)}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Pressable
              style={({pressed}) => pressed && styles.pressed}
              onPress={() => closeHandler()}>
              <View style={styles.close}>
                <Ionicons name="close" size={width * 0.07} color="#454545" />
              </View>
            </Pressable>

            {/* <Pressable
            style={({pressed}) => pressed && styles.pressed}
            onPress={() => saveFormHandler()}>
            <View>
              <Text
                style={{
                  fontSize: width * 0.05,
                  fontWeight: '600',
                  color: 'blue',
                }}>
                Save
              </Text>
            </View>
          </Pressable> */}
          </View>

          <View style={styles.accountsBtn}>
            <Pressable
              style={({pressed}) => pressed && styles.pressed}
              onPress={() => cashBtnPressedHandler()}>
              <View
                style={[styles.accountBtn, {backgroundColor: btnCashColor}]}>
                <Text>Cash</Text>
              </View>
            </Pressable>
            <Pressable
              style={({pressed}) => pressed && styles.pressed}
              onPress={() => accBtnPressedHandler()}>
              <View style={[styles.accountBtn, {backgroundColor: btnAccColor}]}>
                <Text>Accounts</Text>
              </View>
            </Pressable>
          </View>

          {selectedCash && (
            <View style={{marginLeft: 20}}>
              <Text
                style={{
                  fontSize: width * 0.05,
                  fontWeight: '800',
                  marginLeft: 20,
                  marginTop: 20,
                }}>
                Cash
              </Text>
              <View style={styles.searchContainer}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Please Enter budget amount."
                  keyboardType="numeric"
                  // onChange={event => {
                  //   searchFilterHandler(event.nativeEvent.text);
                  // }}
                  onChangeText={setBudget}
                  value={budget}
                />
                <Pressable
                  style={({pressed}) => pressed && styles.pressed}
                  onPress={() => saveCashHandler()}>
                  <Text style={styles.add}>save</Text>
                </Pressable>
              </View>
            </View>
          )}

          {!selectedCash && (
            <>
              <View style={{marginLeft: 20}}>
                <Text style={{fontWeight: '800', fontSize: height * 0.02}}>
                  Search:
                </Text>
              </View>

              <View style={styles.searchContainer}>
                <TextInput
                  style={styles.textInput}
                  placeholder="search or add category"
                  onChange={event => {
                    searchFilterHandler(event.nativeEvent.text);
                  }}
                  onChangeText={setAccountText}
                  value={addAccPressed ? accountText : filteredData}
                />
                <Pressable
                  style={({pressed}) => pressed && styles.pressed}
                  onPress={() => addAccHandler()}>
                  <Text style={styles.add}>add</Text>
                </Pressable>
              </View>
            </>
          )}

          {addAccPressed && !selectedCash && (
            <>
              <View style={styles.searchContainer}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Please enter budget amount."
                  keyboardType="numeric"
                  // onChange={event => {
                  //   searchFilterHandler(event.nativeEvent.text);
                  // }}
                  onChangeText={setBudget}
                  value={budget}
                />
                <Pressable
                  style={({pressed}) => pressed && styles.pressed}
                  onPress={() => saveAccountHandler()}>
                  <Text style={styles.add}>save</Text>
                </Pressable>
              </View>
            </>
          )}

          {!selectedCash && (
            <FlatList
              keyExtractor={item => item.title + uuidv4()}
              data={filteredData}
              renderItem={renderItem}
              bounces={false}
            />
          )}
        </View>
      </Pressable>
    </Modal>
  );
};

export default AddAccountForm;

const styles = StyleSheet.create({
  container: {
    width: WIDTH,
    height: height * 0.75,
    marginHorizontal: 20,
    marginTop: 100,

    shadowOffset: {width: 0.5, height: 0.5},
    shadowOpacity: 0.7,
    shadowRadius: 3,
    elevation: 4,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 10,
    marginTop: 10,
    marginBottom: 25,
    // backgroundColor: 'magenta',
  },
  outSide: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  close: {
    backgroundColor: '#e6e6e6',
    borderColor: 'white',
    width: WIDTH * 0.075,
    height: WIDTH * 0.075,
    marginLeft: WIDTH - WIDTH * 0.08 - 20,

    shadowOffset: {width: 0.5, height: 0.5},
    shadowOpacity: 0.7,
    shadowRadius: 2,
    elevation: 4,
  },
  accountsBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  accountBtn: {
    alignItems: 'center',
    borderWidth: 1,
    paddingVertical: height * 0.008,
    width: WIDTH / 2,
    borderColor: 'lightgrey',
    backgroundColor: 'white',

    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.75,
    shadowRadius: 1,
    elevation: 1,
  },
  searchContainer: {
    alignItems: 'center',
    marginTop: 5,
    marginBottom: 15,
    flexDirection: 'row',
    // backgroundColor: '#facece',
  },
  textInput: {
    width: width * 0.55,
    height: height * 0.05,
    marginRight: 20,
    marginLeft: 20,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: 'grey',
  },
  add: {
    fontSize: WIDTH * 0.055,
    fontWeight: '800',
    color: '#0439c2',
  },
  item: {
    padding: height * 0.012,
    marginTop: 5,
    marginBottom: 10,
    marginHorizontal: 10,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: 'lightgrey',
  },
  pressed: {
    opacity: 0.65,
  },
});
