import csvParse from 'csv-parse';
import fs from 'fs';
import Transaction from '../models/Transaction';
import AppError from '../errors/AppError';
import { getCustomRepository, getRepository, In } from 'typeorm';
import TransactionsRepository from '../repositories/TransactionsRepository';
import Category from '../models/Category';

interface csvTransaction {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class ImportTransactionsService {
  async execute(filePath: string): Promise<Transaction[]> {
    const transactionRepository = getCustomRepository(TransactionsRepository);
    const categoryRepository = getRepository(Category);

    const contactReadStream = fs.createReadStream(filePath);
    const parsers = csvParse({
      from_line: 2, //para pular o header
    });
    const transactions: csvTransaction[] = [];
    const categories: string[] = [];

    const parseCsv = contactReadStream.pipe(parsers);

    parseCsv.on('data', async line => {
      const [title, type, value, category] = line.map((cell: string) =>
        cell.trim()
      );

      if (!title || !type || !value) {
        throw new AppError('Invalid file format', 400);
      }
      //insert com bulk
      categories.push(category);
      transactions.push({ title, type, value, category });
    });
    //espera o evento de end
    await new Promise(resolve => parseCsv.on('end', resolve));
    //verifica se as categorias existem no banco de dados de uma vez soh
    const existentCategories = await categoryRepository.find({
      where:
      {
        title: In(categories),
      }
    });

    const existentCategoriesTitles = existentCategories.map(
      (category: Category) => category.title,
    );

    const addCategory = categories.filter(
      category => !existentCategoriesTitles.includes(category)
    ).filter((value, index, self) => self.indexOf(value) == index);  //duplo filtro, tira repetidos
    //do primeiro filter

    const newCategories = categoryRepository.create(
      addCategory.map(title =>
        ({
          title
        }))
    );

    await categoryRepository.save(newCategories);

    const finalCategories = [...newCategories, ...existentCategories];
    const createdTransactions = transactionRepository.create(
      transactions.map(transaction => ({
        title: transaction.title,
        type: transaction.type,
        value: transaction.value,
        category: finalCategories.find(
          category => category.title === transaction.category
        )
      }))

    )

    await transactionRepository.save(createdTransactions);
    await fs.promises.unlink(filePath); //apagar os arquivos 
    return createdTransactions;

  }


}

export default ImportTransactionsService;
