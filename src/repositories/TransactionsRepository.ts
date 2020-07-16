import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {

  public async getBalance(): Promise<Balance> {
    const transactions = await this.find();

    var income = 0;
    var outcome = 0;

    for (let i = 0; i < transactions.length; i++) {
      if (transactions[i].type === 'income') {
        income = income + Number(transactions[i].value);
      }
      else {
        outcome = outcome + Number(transactions[i].value);
      }
    }

    const total = income - outcome;


    return { income, outcome, total };

  }
}

export default TransactionsRepository;
