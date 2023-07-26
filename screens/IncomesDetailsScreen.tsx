import {FlatList, View} from 'react-native';
import React, {useEffect} from 'react';
import {v4 as uuidv4} from 'uuid';
import moment from 'moment';

// import {currencyFormatter} from '../util/currencyFormatter';
import {useAppSelector} from '../hooks';
import DailyItemElement from '../components/Output/DailyItemElement';
import {IncomesDetailsNavigationProp, IncomesDetailsRouteProp} from '../types';
import {currencyFormatter} from '../util/currencyFormatter';

// const {width, height} = Dimensions.get('window');

const IncomesDetailsScreen = ({route, navigation}: Props) => {
  const dataLoaded = useAppSelector(store => store);

  const Incomes = dataLoaded?.incomes?.incomes;

  const date = route.params.date;
  // const time = route.params.time;

  useEffect(() => {
    navigation.setOptions({
      title: 'Incomes',
      // headerTitleAlign: 'left',
      // headerTitleContainerStyle: {marginLeft: 0},
    });
  }, []);

  const filteredExpenses = Incomes.filter(
    income =>
      moment(income.date).format('YYYY-MM-DD') ===
      moment(date).format('YYYY-MM-DD'),
  );

  // daily renderItem
  function renderItem({item}) {
    // const expenseAmount = currencyFormatter(item.expense_daily, {});
    const incomeAmount = currencyFormatter(item?.amount, {
      significantDigits: 0,
    });
    const accountId = item?.accountId;
    const cateId = item?.cateId;
    const itemId = item?.id;
    const time = moment(item.date).format('LT');

    if (+incomeAmount === 0) {
      return;
    }

    const date = item.date;
    let day = moment(date).date();
    if (day < 10) {
      day = +`0${day}`;
    }

    const dayLabel = moment(date).format('ddd');
    const monthLabel = moment(date).format('MMM');
    const year = moment(date).year();
    const month = moment(date).month() + 1;

    return (
      <DailyItemElement
        amount={incomeAmount}
        type={'income'}
        day={String(day)}
        dayLabel={dayLabel}
        monthLabel={monthLabel}
        year={year}
        time={time}
        month={month}
        accountId={accountId}
        cateId={cateId}
        itemId={itemId}
      />
    );
  }

  return (
    <View>
      <FlatList
        keyExtractor={item => item + uuidv4()}
        data={filteredExpenses}
        renderItem={renderItem}
        bounces={false}
      />
    </View>
  );
};

export default IncomesDetailsScreen;

// const styles = StyleSheet.create({});

// =============================== TYPE ==================================
type Props = {
  navigation: IncomesDetailsNavigationProp;
  route: IncomesDetailsRouteProp;
};
