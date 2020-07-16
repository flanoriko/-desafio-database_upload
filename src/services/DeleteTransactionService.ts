import AppError from '../errors/AppError';
import TransactionRepository from '../repositories/TransactionsRepository';
import { getCustomRepository } from 'typeorm';

interface Request {
  id: string
}


class DeleteTransactionService {
  public async execute({ id }: Request): Promise<void> {
    const transactionRepository = getCustomRepository(TransactionRepository);
    const transaction = await transactionRepository.findOne(id);

    if (!transaction) {
      throw new AppError("Transaction does not exits", 400);
    }

    await transactionRepository.remove(transaction);

  }
}

export default DeleteTransactionService;
