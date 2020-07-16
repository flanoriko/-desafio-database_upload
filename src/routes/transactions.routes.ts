import { Router } from 'express';

import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';

import Transaction from '../models/Transaction';
import multer from 'multer';
import configMulter from '../config/upload';
import uploadConfig from '../config/upload'

import { getCustomRepository } from 'typeorm';
const upload = multer (uploadConfig);

const transactionsRouter = Router();


transactionsRouter.get('/', async (request, response) => {
  const transactionRepository = getCustomRepository(TransactionsRepository);


  const transactions = await transactionRepository.find();
  const balance = await transactionRepository.getBalance();

  return response.json({ transactions, balance });
});

transactionsRouter.post('/', async (request, response) => {

  const { title, value, type, category } = request.body;
  const createTransactionService = new CreateTransactionService();
  const transaction = await createTransactionService.execute({ title, value, type, category });
  return response.json(transaction);
});

transactionsRouter.delete('/:id', async (request, response) => {
  const { id } = request.params;
  const deleteTransactionService = new DeleteTransactionService();
  await deleteTransactionService.execute({ id });
  return response.status(200).json({ msg: "deletado!" });
});

transactionsRouter.post('/import',upload.single('file'),
 async (request, response) => {
 const importTransactions = new ImportTransactionsService();
 const transactions  = await importTransactions.execute(request.file.path);
 return response.json(transactions);
});

export default transactionsRouter;