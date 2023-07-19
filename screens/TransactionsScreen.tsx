import {
  Dimensions,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React, {useCallback, useContext, useEffect, useState} from 'react';
// import {useFocusEffect} from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import moment from 'moment';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';

// import TransactionOutput from '../components/Output/TransactionOutput';
import MonthYearList from '../components/Menu/MonthYearList';
import {TransactionNavigationProp} from '../types';
// import {useSwipe} from '../components/UI/useSwape';
import Tabs from '../components/UI/Tabs';
import {currencyFormatter} from '../util/currencyFormatter';
import {sumTotalFunc} from '../util/math';
import {useAppSelector} from '../hooks';
// import {transactStateActions} from '../store/transaction-state-slice';
import {Auth} from 'aws-amplify';
import {TestIds, useInterstitialAd} from 'react-native-google-mobile-ads';
// import TransactProvider from '../store-context/TransactProvider';
import TransactContext from '../store-context/transact-context';
import TransactionSummary from '../components/Output/TransactionSummary';
import {useSwipe} from '../components/ui-function/useSwipe';

const {width, height} = Dimensions.get('window');

const TabsDataObject = {
  monthly: 'Monthly',
  weekly: 'Weekly',
  daily: 'Daily',
  custom: 'Custom',
  export: 'Export',
};

// Ads variable
const adUnitId = __DEV__
  ? TestIds.INTERSTITIAL
  : 'ca-app-pub-3212728042764573~3355076099';

// Swipe Screen
// Specify initial screen to three screens.
// Swap left/right to push a screen to an array.
// const initialScreens = [
//   {name: 'Screen 1', props: {num: '1'}},
//   {name: 'Screen 2', props: {num: '2'}},
//   {name: 'Screen 3', props: {num: '3'}},
// ];
interface ScreenType {
  tabs: any[];
  setCurrentTabIndex: (index: number) => void;
}

const tabsScreen = Array.from({length: 21}, (_, i) => ({
  name: `Sc ${i}`,
  props: {num: `${i}`},
}));

const middleTabIndex = Math.floor(tabsScreen?.length / 2);

const TopTab = createMaterialTopTabNavigator();

function TransactScreenComponent({tabs, setCurrentTabIndex}: ScreenType) {
  return (
    <TopTab.Navigator
      screenListeners={{
        state: e => {
          // Do something with the state
          // console.log('Page Index: ', e.data?.state?.index);
          setCurrentTabIndex(e.data?.state?.index);
        },
      }}
      initialRouteName={tabs[middleTabIndex]?.name}
      // onTabPress={({index}) => onTabChange(index)}
      screenOptions={() => ({
        tabBarIndicatorStyle: {backgroundColor: 'transparent'},
        tabBarShowLabel: false,
        tabBarContentContainerStyle: {height: 0},
      })}>
      {tabs?.map((tab, index) => (
        <TopTab.Screen key={index} name={tab?.name}>
          {() => <TransactionSummary {...tab.props} />}
        </TopTab.Screen>
      ))}
    </TopTab.Navigator>
  );
}

// Header
function HeaderSummary({total, totalIncome, totalExpenses}: HeaderSummaryType) {
  return (
    <View style={styles.assetsContainer}>
      <View style={styles.assetBox}>
        <Text style={{fontSize: 14}}>Income</Text>
        <Text style={{color: 'blue', fontSize: 16, fontWeight: 'bold'}}>
          {currencyFormatter(+totalIncome, {})}
        </Text>
      </View>
      <View style={styles.assetBox}>
        <Text style={{fontSize: 14}}>Expenses</Text>
        <Text style={{color: 'red', fontSize: 16, fontWeight: 'bold'}}>
          {currencyFormatter(+totalExpenses, {})}
        </Text>
      </View>
      <View style={styles.assetBox}>
        <Text style={{fontSize: 14}}>Total</Text>
        <Text style={{fontSize: 16, fontWeight: 'bold'}}>
          {currencyFormatter(+total, {})}
        </Text>
      </View>
    </View>
  );
}

// Main
const TransactionsScreen = ({navigation}: Props) => {
  // const dispatch = useAppDispatch();
  const dataLoaded = useAppSelector(store => store);

  const ExpenseData = dataLoaded?.expenses?.expenses;
  const IncomeData = dataLoaded?.incomes?.incomes;
  const customerInfosData = dataLoaded?.customerInfos?.customerInfos;

  // const scrollViewRef = useRef(null);
  const [currentTabIndex, setCurrentTabIndex] = useState<number | undefined>(
    middleTabIndex,
  );
  const [swipeLeft, setSwipeLeft] = useState<boolean>(false);
  const [swipeRight, setSwipeRight] = useState<boolean>(false);

  const [duration, setDuration] = useState<string | null>(
    moment().format('MMM'),
  );
  const [month, setMonth] = useState<string>('');
  const [year, setYear] = useState<string>(String(moment().year()));
  const [isDatePickerVisible, setDatePickerVisibility] =
    useState<boolean>(false);
  const [mode, setMode] = useState<string>('date');
  const [fromDateClicked, setFromDateClicked] = useState<boolean>(false);
  const [toDateClicked, setToDateClicked] = useState<boolean>(false);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [indicatorIndex, setIndicatorIndex] = useState<number | undefined>(0);
  const [tabs, setTabs] = useState<any>(tabsScreen);

  const {isLoaded, isClosed, load, show} = useInterstitialAd(adUnitId, {
    requestNonPersonalizedAdsOnly: true,
  });

  const transactCtx = useContext(TransactContext);

  // Load ads
  useEffect(() => {
    // Start loading the interstitial straight away
    load();
  }, [load]);

  // Load ads again
  useEffect(() => {
    if (isClosed) {
      // console.log('Reloading ad...');
      load();
    }
  }, [isClosed]);

  // Initial from date, to date
  useEffect(() => {
    let initTime = moment().year();
    // if (indicatorIndex === 0) {
    onMonthYearSelectedHandler(initTime);
    // }
  }, []);

  useEffect(() => {
    if (indicatorIndex === 0) {
      monthlyHandler(year);
    }
    if (indicatorIndex === 1) {
      weeklyHandler(month, year);
    }
    if (indicatorIndex === 2) {
      dailyHandler(month, year);
    }

    // return () => {
    // console.log('CLEANUP');
    // };
  }, [year, month]);

  useEffect(() => {
    changeMonthYearHandler();

    // return () => {
    // console.log('CLEANUP');
    // };
  }, [currentTabIndex]);

  // Header Right
  useEffect(() => {
    navigation.setOptions({
      // title: !customPressed && !exportPressed ? 'Transactions' : '',
      title: '',
      headerTitleAlign: 'left',
      // headerStyle: {
      //   height: height * 0.06,
      //   backgroundColor: '#b1fd90',
      // },
      headerRight: () => (
        <>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'flex-end',
              marginLeft: width / 2,
              width: width * 0.5,
              marginTop: height * 0.032,
              // backgroundColor: '#fed8d8',
            }}>
            {!transactCtx.customPressed && !transactCtx.exportPressed && (
              <Pressable
                style={({pressed}) => pressed && styles.pressed}
                onPress={() => showMonthYearListMenuHandler()}>
                <View
                  style={{
                    marginRight: 25,
                    // marginTop: 20,
                    paddingHorizontal: 5,
                    paddingVertical: 3.5,
                    borderWidth: 0.6,
                    borderColor: 'grey',
                  }}>
                  <Text>{`${duration} ${
                    !transactCtx.monthlyPressed ? year : ''
                  }`}</Text>
                </View>
              </Pressable>
            )}

            {(transactCtx.customPressed || transactCtx.exportPressed) && (
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  width: width * 0.5,
                  marginRight: width / 8,
                  // borderWidth: 0.6,
                  // borderColor: 'lightgrey',
                }}>
                <Pressable
                  style={({pressed}) => pressed && styles.pressed}
                  onPress={onFromDateHandler}>
                  <View style={{borderWidth: 0.6, borderColor: 'lightgrey'}}>
                    <Text>
                      {moment(transactCtx.fromDate).format('YYYY-MM-DD')}
                    </Text>
                  </View>
                </Pressable>
                <Pressable
                  style={({pressed}) => pressed && styles.pressed}
                  onPress={onToDateHandler}>
                  <View style={{borderWidth: 0.6, borderColor: 'lightgrey'}}>
                    {/* <Text>2022-09-30</Text> */}
                    <Text>
                      {moment(transactCtx.toDate).format('YYYY-MM-DD')}
                    </Text>
                  </View>
                </Pressable>
              </View>
            )}

            <Pressable
              style={({pressed}) => pressed && styles.pressed}
              onPress={() => navigation.navigate('Stats')}>
              <View style={{marginRight: 20}}>
                <Ionicons
                  name="stats-chart-outline"
                  size={20}
                  color="#0047b8"
                />
              </View>
            </Pressable>
          </View>
          {/* <View
            style={{
              // backgroundColor: 'red',
              marginTop: 10,
            }}> */}
          <Tabs
            TabsDataObject={TabsDataObject}
            onItemPress={onItemPress}
            indicatorIndex={indicatorIndex}
          />
          {/* </View> */}
        </>
      ),
    });
  }, [
    navigation,
    duration,
    year,
    // month,
    isModalVisible,
    transactCtx.monthlyPressed,
    transactCtx.weeklyPressed,
    transactCtx.dailyPressed,
    transactCtx.customPressed,
    transactCtx.exportPressed,
    transactCtx.fromDate,
    transactCtx.toDate,
  ]);

  // Initialize State
  useEffect(() => {
    transactCtx.tabPressedHandler({
      monthlyPressed: true,
      weeklyPressed: false,
      dailyPressed: false,
      customPressed: false,
      exportPressed: false,
    });

    () => {};
  }, []);

  //
  const onItemPress = useCallback(
    (itemIndex: number) => {
      setIndicatorIndex(itemIndex);
      if (itemIndex === 0) {
        monthlyHandler(year);
        // updateState();
      }
      if (itemIndex === 1) {
        weeklyHandler(month, year);
        // updateState();
      }
      if (itemIndex === 2) {
        dailyHandler(month, year);
        // updateState();
      }
      if (itemIndex === 3) {
        customHandler();
        // updateState();
      }
      if (itemIndex === 4) {
        exportsHandler();
        // updateState();
      }
    },
    [
      transactCtx.monthlyPressed,
      transactCtx.weeklyPressed,
      transactCtx.dailyPressed,
      transactCtx.customPressed,
      transactCtx.exportPressed,
      duration,
    ],
  );

  function onMonthYearSelectedHandler(time) {
    if (transactCtx.monthlyPressed) {
      // const mm = moment().month(time).format('M');
      // const daysInMonth = moment(`${year}-0${mm}`, 'YYYY-MM').daysInMonth();
      const fromdate = moment([time, 0]).format('YYYY-MM-DD');
      const todate = moment(`${time}-12-31`).endOf('year').format('YYYY-MM-DD');

      setYear(time);

      transactCtx.fromDateSetHandler({
        fromDate: fromdate,
      });
      transactCtx.toDateSetHandler({
        toDate: todate,
      });
    }
    setDuration(time);
    setMonth(String(+moment().month() + 1));
    setIsModalVisible(false);

    if (!transactCtx.monthlyPressed) {
      const mm = moment().month(time).format('M');
      const daysInMonth = moment(`${year}-${mm}`, 'YYYY-M').daysInMonth();
      const fromdate = moment([year, +mm - 1]).format('YYYY-MM-DD');
      const todate = moment(`${year}-0${mm}-${daysInMonth}`).format(
        'YYYY-MM-DD',
      );

      const month = moment(fromdate).month() + 1;

      transactCtx.fromDateSetHandler({
        fromDate: fromdate,
      });
      transactCtx.toDateSetHandler({
        toDate: todate,
      });

      setDuration(time);
      setMonth(month);
      setIsModalVisible(false);
    }
  }

  function showMonthYearListMenuHandler() {
    setIsModalVisible(!isModalVisible);
  }

  function onFromDateHandler() {
    showDatePicker();
    setFromDateClicked(true);
  }

  function onToDateHandler() {
    showDatePicker();
    setToDateClicked(true);
  }

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  function hideDatePicker() {
    setDatePickerVisibility(false);
  }

  const onConfirm = (date: string) => {
    const fromdate = moment(date).format('YYYY-MM-DD');
    const todate = moment(date).format('YYYY-MM-DD');
    if (fromDateClicked) {
      // setFromDate(fromdate);
      transactCtx.fromDateSetHandler({
        fromDate: fromdate,
      });
    }
    if (toDateClicked) {
      // setToDate(todate);
      transactCtx.toDateSetHandler({
        toDate: todate,
      });
    }
    setFromDateClicked(false);
    setToDateClicked(false);
    hideDatePicker();
  };

  // Month Func
  const monthlyHandler = year => {
    // const fromdate = moment(`${year}-01-01`);
    // const todate = moment(`${year}-12-31`);
    const fromdate = moment(`${year}-01-01`).format('YYYY-MM-DD');
    const todate = moment(`${year}-12-31`).format('YYYY-MM-DD');

    setDuration(year);
    // setDuration(String(moment(toDate).year()));
    transactCtx.fromDateSetHandler({
      fromDate: fromdate,
    });
    transactCtx.toDateSetHandler({
      toDate: todate,
    });

    transactCtx.tabPressedHandler({
      monthlyPressed: true,
      weeklyPressed: false,
      dailyPressed: false,
      customPressed: false,
      exportPressed: false,
    });
  };

  // Week Func
  const weeklyHandler = (month, year) => {
    let Month = month === '' ? `${moment().month()}` + 1 : month;

    if (+Month < 10) {
      Month = `0${Month}`;
    }

    let currentDate = moment().date();
    if (currentDate < 10) {
      currentDate = +`0${currentDate}`;
    }
    const date = moment(`${year}-${Month}-${currentDate}`).format('YYYY-MM-DD');

    const daysInMonth = moment(
      moment().format(`YYYY-${Month}`),
      'YYYY-MM',
    ).daysInMonth();
    const fromdate = moment(`${year}-${Month}-01`).format('YYYY-MM-DD');
    const todate = moment(`${year}-${Month}-${daysInMonth}`).format(
      'YYYY-MM-DD',
    );

    // typeof duration === 'number'
    setDuration(moment.monthsShort(moment(date).month()));
    // : '';

    transactCtx.fromDateSetHandler({
      fromDate: fromdate,
    });
    transactCtx.toDateSetHandler({
      toDate: todate,
    });

    transactCtx.tabPressedHandler({
      monthlyPressed: false,
      weeklyPressed: true,
      dailyPressed: false,
      customPressed: false,
      exportPressed: false,
    });
  };

  const dailyHandler = (month, year) => {
    let Month = month === '' ? `${moment().month() + 1}` : month;

    if (+Month < 10) {
      Month = `0${Month}`;
    }

    const date = moment().format(`${year}-${Month}-DD`);
    const daysInMonth = moment(
      moment().format(`YYYY-${Month}`),
      'YYYY-MM',
    ).daysInMonth();
    const fromdate = moment(`${year}-${Month}-01`).format('YYYY-MM-DD');
    const todate = moment(`${year}-${Month}-${daysInMonth}`).format(
      'YYYY-MM-DD',
    );

    // typeof duration === 'number'
    setDuration(moment.monthsShort(moment(date).month()));
    // : '';

    transactCtx.fromDateSetHandler({
      fromDate: fromdate,
    });
    transactCtx.toDateSetHandler({
      toDate: todate,
    });

    transactCtx.tabPressedHandler({
      monthlyPressed: false,
      weeklyPressed: false,
      dailyPressed: true,
      customPressed: false,
      exportPressed: false,
    });
  };

  const customHandler = () => {
    let MONTH;
    MONTH = month;
    if (+MONTH < 10) {
      MONTH = `0${MONTH}`;
    }

    let today = moment().date();
    if (+today < 10) {
      today = +`0${today}`;
    }

    const fromdate = moment(`${year}-${MONTH}-01`).format('YYYY-MM-DD');
    const todate = moment(`${year}-${MONTH}-${today}`).format('YYYY-MM-DD');

    transactCtx.fromDateSetHandler({
      fromDate: fromdate,
    });
    transactCtx.toDateSetHandler({
      toDate: todate,
    });

    transactCtx.tabPressedHandler({
      monthlyPressed: false,
      weeklyPressed: false,
      dailyPressed: false,
      customPressed: true,
      exportPressed: false,
    });
  };

  // Export Handler
  async function exportsHandler() {
    transactCtx.tabPressedHandler({
      monthlyPressed: false,
      weeklyPressed: false,
      dailyPressed: false,
      customPressed: false,
      exportPressed: true,
    });

    const authUser = await Auth.currentAuthenticatedUser();
    const appUserId = authUser?.attributes?.sub;
    const filteredCustomerInfo = customerInfosData?.filter(
      cus => cus.appUserId === appUserId,
    );

    if (
      !filteredCustomerInfo[0]?.stdActive &&
      !filteredCustomerInfo[0]?.proActive
    ) {
      // show Ads
      if (isLoaded) {
        show();
      }
    }
  }

  // FILTERED DATA (From date ----> To date)
  const selectedDurationExpenseData = ExpenseData?.filter(
    expense =>
      moment(expense.date).format('YYYY-MM-DD') >= transactCtx.fromDate &&
      moment(expense.date).format('YYYY-MM-DD') <= transactCtx.toDate,
  );
  const selectedDurationIncomeData = IncomeData?.filter(
    income =>
      moment(income.date).format('YYYY-MM-DD') >= transactCtx.fromDate &&
      moment(income.date).format('YYYY-MM-DD') <= transactCtx.toDate,
  );

  // TOTAL EXPENSE
  const totalExpenses = +sumTotalFunc(selectedDurationExpenseData).toFixed(0);
  const totalIncome = +sumTotalFunc(selectedDurationIncomeData).toFixed(0);
  const total = totalIncome - totalExpenses;

  // Detect swipe screen: Left and Right
  const {onTouchStart, onTouchEnd} = useSwipe(onSwipeLeft, onSwipeRight, 4);

  // Increase or Decrease Year
  const changeMonthYearHandler = () => {
    if (swipeLeft) {
      if (indicatorIndex === 0) {
        setYear(prev => +prev + 1);
      }
      if (indicatorIndex === 1) {
        setMonth(prev => {
          let newMonth = +prev + 1;

          if (newMonth > 12) {
            newMonth = (newMonth % 13) + 1;
          }

          return newMonth;
        });
      }
      if (indicatorIndex === 2) {
        setMonth(prev => {
          let newMonth = +prev + 1;

          if (newMonth > 12) {
            newMonth = (newMonth % 13) + 1;
          }

          return newMonth;
        });
      }
    }

    if (swipeRight) {
      if (indicatorIndex === 0) {
        setYear(prev => Math.abs(+prev - 1));
      }
      if (indicatorIndex === 1) {
        setMonth(prev => {
          let newMonth = Math.abs(+prev - 1);

          if (newMonth > 13) {
            newMonth = (newMonth % 13) + 1;
          }

          return newMonth;
        });
      }
      if (indicatorIndex === 2) {
        setMonth(prev => {
          let newMonth = Math.abs(+prev - 1);

          if (newMonth > 13) {
            newMonth = (newMonth % 13) + 1;
          }

          return newMonth;
        });
      }
    }
  };

  // Swipe Left
  function onSwipeLeft() {
    // console.log('SWIPE_LEFT');
    setSwipeLeft(true);
    setSwipeRight(false);

    // updatedLeftTabs();
  }

  // Swipe Right
  function onSwipeRight() {
    // console.log('SWIPE_RIGHT');
    setSwipeLeft(false);
    setSwipeRight(true);

    // updatedRightTabs();
  }

  return (
    <View
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      style={styles.container}>
      <View style={{marginTop: 18}}>
        <HeaderSummary
          total={total}
          totalIncome={totalIncome}
          totalExpenses={totalExpenses}
        />
      </View>

      <TransactScreenComponent
        setCurrentTabIndex={setCurrentTabIndex}
        // scrollViewRef={scrollViewRef}
        tabs={tabs}
      />

      <MonthYearList
        monthlyPressed={transactCtx.monthlyPressed}
        onMYSelectedHandler={onMonthYearSelectedHandler}
        year={+year}
        setYear={setYear}
        month={+month}
        setIsModalVisible={setIsModalVisible}
        isModalVisible={isModalVisible}
      />

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        // onChange={onChange}
        onCancel={hideDatePicker}
        onConfirm={onConfirm}
        value={
          toDateClicked
            ? transactCtx.toDate
            : fromDateClicked
            ? transactCtx.fromDate
            : ''
        }
        mode={mode}
        // today={onTodayHandler}
        is24Hour={true}
        display={Platform.OS === 'ios' ? 'inline' : 'default'}
        style={styles.datePicker}
      />
    </View>
  );
};

export default TransactionsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: width,
  },
  assetsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
    marginVertical: 5,
    backgroundColor: 'white',
    borderColor: '#b8b8b8',
    borderBottomWidth: 0.4,
  },
  assetBox: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  pressed: {
    opacity: 0.65,
  },
});

// ============================ TYPE =====================================
type Props = {
  navigation: TransactionNavigationProp;
};

interface HeaderSummaryType {
  total: number;
  totalIncome: number;
  totalExpenses: number;
}
