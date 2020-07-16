// import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import Category from '../models/Category';
import TransactionRepository from '../repositories/TransactionsRepository';
import { getCustomRepository, getRepository } from 'typeorm';
import AppErrors from '../errors/AppError';

interface Request {
  title: string;
  value: number;
  category: string;
  type: 'income' | 'outcome';
}

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

class CreateTransactionService {
  public async execute({ title, value, category, type }: Request): Promise<Transaction> {
    const transactionRepository = getCustomRepository(TransactionRepository);

    const categoryRepository = getRepository(Category);
    let transactionCategory = await categoryRepository.findOne({ where: { title: category } });

    if (!transactionCategory) {
      transactionCategory = categoryRepository.create({ title: category });
      await categoryRepository.save(transactionCategory);
    }

    const balance = await transactionRepository.getBalance();

    if (balance.total - value < 0 && type === 'outcome') {
      throw new AppErrors('should not be able to create outcome transaction without a valid balance', 400);
    }

    const transaction = transactionRepository.create({
      title
      , type
      , value
      , category: transactionCategory
    });

    await transactionRepository.save(transaction);
    return transaction;

  }
}

export default CreateTransactionService;
