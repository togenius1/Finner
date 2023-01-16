import {Pressable, StyleSheet, Text, View} from 'react-native';
import React, {useCallback, useEffect, useState} from 'react';
import moment from 'moment';

// import IconButton from '../components/UI/iconButton';
// import BarChartTab from './screenComponents/BarChartTab';
import TimeLineTab from '../components/Graph/TimeLineScreen';
import Tabs from '../components/UI/Tabs';
import LineChart from '../components/Graph/LineChart';
import {sumByCustomMonth} from '../util/math';
// import {EXPENSES, INCOME} from '../dummy/dummy';
// import {useNavigation} from '@react-navigation/native';
import MonthYearList from '../components/Menu/MonthYearList';
import {StatsNavigationProp} from '../types';
import {ExpenseType} from '../models/expense';
import {IncomeType} from '../models/income';
import {useAppDispatch, useAppSelector} from '../hooks';
import {fetchExpensesData} from '../store/expense-action';
import {fetchIncomesData} from '../store/income-action';

type Props = {
  navigation: StatsNavigationProp;
};

// const {width, height} = Dimensions.get('window');

const dataTabsObject = {
  // barchart: 'BarChart',
  budget: 'Budgets',
  expense: 'Expense',
  income: 'Income',
};

const initFromDate = `${moment().year()}-0${moment().month() + 1}-01`;
const initToDate = moment().format('YYYY-MM-DD');

function HeaderRightComponent({
  indicatorIndex,
  year,
  month,
  setIsModalVisible,
}) {
  const monthName = moment.monthsShort(month - 1);

  return (
    <View>
      <Pressable
        style={({pressed}) => pressed && styles.pressed}
        onPress={() => setIsModalVisible(true)}>
        <View
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            // backgroundColor: '#ffd3d3',
            marginRight: 25,
          }}>
          <Text style={{fontSize: 16, color: '#2a8aff'}}>
            {indicatorIndex !== 0 ? '' : monthName} {year}
          </Text>
        </View>
      </Pressable>
    </View>
  );
}

const StatsScreen = ({navigation}: Props) => {
  // const dispatch = useAppDispatch();
  const dataLoaded = useAppSelector(store => store);
  // const navigation = useNavigation();

  const expenseData = dataLoaded?.expenses?.expenses;
  const incomeData = dataLoaded?.incomes?.incomes;

  // const [expenseData, setExpenseData] = useState<ExpenseType>();
  // const [incomeData, setIncomeData] = useState<IncomeType>();
  // const [showMonthYearListMenu, setShowMonthYearListMenu] =
  //   useState<boolean>(false);
  const [fromDate, setFromDate] = useState<string | null>(initFromDate);
  const [toDate, setToDate] = useState<string | null>(initToDate);
  const [indicatorIndex, setIndicatorIndex] = useState<number | undefined>(0);
  const [year, setYear] = useState<string | null>(String(moment().year()));
  const [month, setMonth] = useState<number | undefined>(moment().month() + 1);
  // const [duration, setDuration] = useState(moment().year());
  const onItemPress = useCallback((itemIndex: number) => {
    setIndicatorIndex(itemIndex);
    if (itemIndex === 0) {
      // console.log(itemIndex);
      // setFromToDateBudgetHandler();
    }
    if (itemIndex === 1) {
      // console.log(itemIndex);
      setFromToDateExpenseIncomeHandler();
    }
    if (itemIndex === 2) {
      // console.log(itemIndex);
      setFromToDateExpenseIncomeHandler();
    }
  }, []);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

  useEffect(() => {
    onMonthYearSelectedHandler(moment().month());
  }, [indicatorIndex]);

  useEffect(() => {
    navigation.setOptions({
      title: '',
      headerRight: () => (
        <HeaderRightComponent
          year={year}
          month={month}
          indicatorIndex={indicatorIndex}
          setIsModalVisible={setIsModalVisible}
        />
      ),
    });
    if (indicatorIndex === 1 || indicatorIndex === 2) {
      setFromToDateExpenseIncomeHandler();
    }
  }, [navigation, year, month, indicatorIndex, ,]);

  if (
    expenseData === null ||
    expenseData === undefined ||
    incomeData === null ||
    incomeData === undefined
  ) {
    return;
  }

  // function setFromToDateBudgetHandler() {
  //   if (month === moment().month() + 1) {
  //     setFromDate(moment().format(`${year}-${`0${month}`}-01`));
  //     setToDate(moment().format(`${year}-${`0${month}`}-DD`));
  //   } else {
  //     const mm = moment().month(month).format('MM');
  //     const days = moment(moment().format(`YYYY-${mm}`)).daysInMonth();
  //     setFromDate(moment().format(`${year}-${mm}-01`));
  //     setToDate(moment().format(`${year}-${mm}-${days}`));
  //   }
  // }

  function setFromToDateExpenseIncomeHandler() {
    if (year === String(moment().year())) {
      setFromDate(moment().format(`${year}-01-01`));
      setToDate(moment().format(`${year}-MM-DD`));
    } else {
      setFromDate(moment().format(`${year}-01-01`));
      setToDate(moment().format(`${year}-12-31`));
    }
  }

  // Set Month Year
  function onMonthYearSelectedHandler(time) {
    let fromdate;
    let todate;
    let month;
    const mm = moment().month(time).format('MM');
    const daysInMonth = moment(moment().format(`YYYY-${mm}`)).daysInMonth();

    if (indicatorIndex === 1 || indicatorIndex === 2) {
      fromdate = `${year}-01-01`;
      todate = `${year}-12-31`;
      month = moment().month() + 1;
      setYear(String(moment(fromdate)?.year()));
    }
    if (indicatorIndex === 0) {
      fromdate = `${year}-${mm}-01`;
      todate = `${year}-${mm}-${daysInMonth}`;
      month = moment(fromdate).month() + 1;
    }

    setFromDate(String(fromdate));
    setToDate(String(todate));
    setMonth(month);
    setIsModalVisible(false);
  }

  // Filter Expense Data
  const filteredDataExpense = expenseData?.filter(
    d => moment(d.date) >= moment(fromDate) && moment(d.date) <= moment(toDate),
  );
  const sumExpenseByMonthObj = sumByCustomMonth(
    filteredDataExpense,
    'expense',
    fromDate,
    toDate,
  );

  console.log(filteredDataExpense);
  console.log(sumExpenseByMonthObj);

  // data for expense line chart
  const filteredDataIncome = incomeData?.filter(
    d => d.date >= new Date(fromDate) && d.date <= new Date(toDate),
  );
  const sumIncomeByMonthObj = sumByCustomMonth(
    filteredDataIncome,
    'income',
    fromDate,
    toDate,
  );

  const renderTabs = () => {
    return (
      <View>
        <Tabs
          TabsDataObject={dataTabsObject}
          onItemPress={onItemPress}
          indicatorIndex={indicatorIndex}
        />
      </View>
    );
  };

  const RenderBudgetsTab = () => {
    return (
      <View style={{flex: 1}}>
        <TimeLineTab
          data={filteredDataExpense}
          fromDate={fromDate}
          toDate={toDate}
        />
      </View>
    );
  };

  const RenderExpenseTab = () => {
    return (
      <View style={{marginTop: 25}}>
        <View
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 20,
          }}>
          <Text style={{fontSize: 18, fontWeight: 'bold'}}>Expense</Text>
        </View>

        <LineChart
          lineChartData={sumExpenseByMonthObj}
          lineChartColor="red"
          circleColor="red"
        />
      </View>
    );
  };

  const RenderIncomeTab = () => {
    return (
      <View style={{marginTop: 25}}>
        <View
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 20,
          }}>
          <Text style={{fontSize: 18, fontWeight: 'bold'}}>Income</Text>
        </View>
        <LineChart
          lineChartData={sumIncomeByMonthObj}
          lineChartColor="#006057"
          circleColor="#006057"
        />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {renderTabs()}
      {indicatorIndex === 0 && <RenderBudgetsTab />}
      {indicatorIndex === 1 && <RenderExpenseTab />}
      {indicatorIndex === 2 && <RenderIncomeTab />}

      <MonthYearList
        monthlyPressed={indicatorIndex !== 0 ? true : false}
        onMYSelectedHandler={onMonthYearSelectedHandler}
        year={year}
        setYear={setYear}
        isModalVisible={isModalVisible}
        setIsModalVisible={setIsModalVisible}
      />

      {/* <View style={styles.addButtonContainer}>
        <IconButton
          name="add-outline"
          size={15}
          onPress={() => navigation.navigate('AddExpenses')}
        />
      </View> */}
    </View>
  );
};

export default StatsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: 50,
  },
  pressed: {
    opacity: 0.75,
  },
});
