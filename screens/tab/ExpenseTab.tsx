import React, {useEffect, useState} from 'react';

import ExpenseOutput from '../../components/Output/ExpenseOutput';
import {EXPENSES} from '../../dummy/dummy';
import {ExpenseType} from '../../models/expense';
import {ExpenseTabRouteProp} from '../../types';

type Props = {
  route: ExpenseTabRouteProp;
};

const ExpenseTab = ({route}: Props) => {
  const [expensesData, setExpensesData] = useState<ExpenseType>();

  const fromDate = route.params?.fromDate;
  const toDate = route.params?.toDate;

  useEffect(() => {
    setExpensesData(EXPENSES);
  }, []);

  if (expensesData === null || expensesData === undefined) {
    return;
  }

  return (
    <ExpenseOutput data={expensesData} fromDate={fromDate} toDate={toDate} />
  );
};

export default ExpenseTab;