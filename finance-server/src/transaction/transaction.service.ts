import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Transactions } from './transaction.model';
import { CreateTransactionDTO } from './dto/transaction-create.dto';
import { ITransaction } from './interface/transaction.interface';
import { Account } from '../accounts/account.model';
import { Categories } from '../categories/categories.model';
import { PaginationDto } from 'src/pagination/dto/pagination.dto';
import { PaginatedTransaction } from './interface/paginatedTransaction';
import PdfPrinter = require('pdfmake');
import * as fs from 'fs';
import { join } from 'path';
@Injectable()
export class TransactionService {
  constructor(
    @InjectModel(Transactions)
    private readonly transactionModel: typeof Transactions,
    @InjectModel(Account)
    private readonly accountModel: typeof Account,
    @InjectModel(Categories)
    private readonly categoriesModel: typeof Categories,
  ) {}

  async create(
    userId: number,
    transaction: CreateTransactionDTO,
  ): Promise<Transactions> {
    if (!userId) {
      throw new UnauthorizedException('User not authorized');
    }

    const account = await this.accountModel.findOne({
      where: {
        id: transaction.accountId,
        userId,
      },
      attributes: ['id', 'balance'],
    });
    if (!account) {
      throw new HttpException(
        'Current Account does not exist',
        HttpStatus.BAD_REQUEST,
      );
    }

    const category = await this.categoriesModel.findOne({
      where: {
        id: transaction.categoryId,
        userId,
      },
    });
    if (!category) {
      throw new HttpException(
        'Current Category does not exist',
        HttpStatus.BAD_REQUEST,
      );
    }

    const amount = Number(transaction.amount);
    if (isNaN(amount) || amount <= 0) {
      throw new HttpException(
        'Invalid transaction amount',
        HttpStatus.BAD_REQUEST,
      );
    }

    let balance = Number(account.getDataValue('balance')) || 0;

    if (transaction.type === 'expense') {
      if (balance < amount) {
        throw new HttpException(
          'Not enough balance in account',
          HttpStatus.BAD_REQUEST,
        );
      }
      balance -= amount;
    } else if (transaction.type === 'income') {
      balance += amount;
    } else {
      throw new HttpException(
        'Invalid transaction type',
        HttpStatus.BAD_REQUEST,
      );
    }

    // сохраняем числовой баланс
    account.setDataValue('balance', balance);
    await account.save();

    const newTransaction: ITransaction = {
      ...transaction,
      userId,
    };

    return this.transactionModel.create(newTransaction);
  }

  async findAll(
    userId: number,
    paginationDTO?: PaginationDto,
  ): Promise<PaginatedTransaction> {
    const page = paginationDTO?.page ?? 1;
    const limit = paginationDTO?.limit ?? 10;
    const offset = (page - 1) * limit;
    if (!userId) {
      throw new UnauthorizedException('User not authorized');
    }

    const { count, rows } = await this.transactionModel.findAndCountAll({
      where: { userId },
      include: [
        {
          model: this.accountModel,
          attributes: ['name'], // берем только имя счета
        },
        {
          model: this.categoriesModel,
          attributes: ['name'], // берем только имя счета
        },
      ],
      order: [['createdAt', 'DESC']],
      offset,
      limit,
    });

    const transactions: Transactions[] = rows.map((row) =>
      row.get({ plain: true }),
    ) as Transactions[];
    const totalPages = Math.ceil(count / limit);

    return {
      data: transactions,
      totalCount: count,
      totalPages,
      currentPage: page,
    };
  }

  async destroy(id: number, userId: number): Promise<void> {
    const transaction = await this.transactionModel.findByPk(id);

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    if (transaction.getDataValue('userId') !== userId) {
      throw new UnauthorizedException(
        'User not authorized to delete this transaction',
      );
    }

    const account = await this.accountModel.findOne({
      where: {
        id: transaction.getDataValue('accountId'),
        userId,
      },
      attributes: ['id', 'balance'],
    });

    if (!account) {
      throw new HttpException(
        'Current Account does not exist',
        HttpStatus.BAD_REQUEST,
      );
    }

    const amount = Number(transaction.getDataValue('amount'));
    if (isNaN(amount) || amount <= 0) {
      throw new HttpException(
        'Invalid transaction amount',
        HttpStatus.BAD_REQUEST,
      );
    }

    let balance = Number(account.getDataValue('balance')) || 0;

    if (transaction.getDataValue('type') === 'expense') {
      balance += amount; // возвращаем при удалении расхода
    } else if (transaction.getDataValue('type') === 'income') {
      balance -= amount; // вычитаем при удалении дохода
    }

    account.setDataValue('balance', balance);
    await account.save();

    await transaction.destroy();
  }

  async update(
    id: number,
    userId: number,
    updates: Partial<Transactions>,
  ): Promise<Transactions> {
    const transaction = await this.transactionModel.findByPk(id);
    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    if (transaction.getDataValue('userId') !== userId) {
      throw new UnauthorizedException(
        'User not authorized to update this transaction',
      );
    }

    const account = await this.accountModel.findOne({
      where: {
        id: transaction.getDataValue('accountId'),
        userId,
      },
      attributes: ['id', 'balance'],
    });

    if (!account) {
      throw new HttpException(
        'Current Account does not exist',
        HttpStatus.BAD_REQUEST,
      );
    }

    let balance = Number(account.getDataValue('balance')) || 0;
    const oldAmount = Number(transaction.getDataValue('amount')) || 0;
    const newAmount = Number(updates.amount ?? oldAmount);

    if (isNaN(newAmount) || newAmount < 0) {
      throw new HttpException(
        'Invalid transaction amount',
        HttpStatus.BAD_REQUEST,
      );
    }

    const type = updates.type ?? transaction.getDataValue('type');

    if (type === 'income') {
      balance = balance - oldAmount + newAmount;
    } else if (type === 'expense') {
      balance = balance + oldAmount - newAmount;
    } else {
      throw new HttpException(
        'Invalid transaction type',
        HttpStatus.BAD_REQUEST,
      );
    }

    account.setDataValue('balance', balance);
    await account.save();

    const updatedTransaction = await transaction.update(updates);

    return updatedTransaction;
  }

  async generatePdf(
    userId: number,
    firstName: string,
    lastName: string,
  ): Promise<string> {
    if (!userId) throw new UnauthorizedException('User not authorized');

    const transactions = await this.transactionModel.findAll({
      where: { userId },
      include: [
        { model: Account, as: 'account' },
        { model: Categories, as: 'categories' },
      ],
      order: [['createdAt', 'DESC']],
    });

    const fonts = {
      Roboto: {
        normal: join(process.cwd(), 'fonts/Roboto-Regular.ttf'),
        italics: join(process.cwd(), 'fonts/Roboto-Italic.ttf'),
        bold: join(process.cwd(), 'fonts/Roboto-Bold.ttf'),
      },
    };

    const plainTransactions = transactions.map((t) => t.get({ plain: true }));    
    const body = [
      [
        { text: 'Date', style: 'tableHeader' },
        { text: 'Account', style: 'tableHeader' },
        { text: 'Category', style: 'tableHeader' },
        { text: 'Type', style: 'tableHeader' },
        { text: 'Amount', style: 'tableHeader', alignment: 'right' },
      ],
      ...plainTransactions.map((t) => [
        t.createdAt ? t.createdAt.toISOString().split('T')[0] : '-',
        t.account?.name ?? '-',
        t.categories?.name ?? '-',
        t.type ?? '-',
        t.amount?.toLocaleString() ?? '0',
      ]),
    ];

    const printer = new PdfPrinter(fonts);

    const docDefinition = {
      content: [
        // Заголовок компании
        { text: 'Jotter-Finance', style: 'company' },

        {
          text: `User: ${firstName} ${lastName}`,
          style: 'user',
          margin: [0, 0, 0, 15],
        },

        { text: 'Transaction Report', style: 'title', margin: [0, 0, 0, 10] },

        {
          table: {
            headerRows: 1,
            widths: ['*', '*', '*', '*', 'auto'],
            body,
          },
          layout: {
            fillColor: (rowIndex: number) =>
              rowIndex === 0
                ? '#dce6f1'
                : rowIndex % 2 === 0
                  ? '#f8f8f8'
                  : null,
            hLineWidth: () => 0.5,
            vLineWidth: () => 0.5,
            hLineColor: () => '#b0b0b0',
            vLineColor: () => '#b0b0b0',
            paddingLeft: () => 6,
            paddingRight: () => 6,
            paddingTop: () => 4,
            paddingBottom: () => 4,
          },
          margin: [0, 0, 0, 15],
        },

        {
          text: `Generated on: ${new Date().toLocaleString()}`,
          style: 'footer',
          margin: [0, 10, 0, 5],
        },

        // Благодарность
        {
          text: 'Thank you for using our service!',
          style: 'thankYou',
        },
      ],
      styles: {
        company: {
          fontSize: 18,
          bold: true,
          color: '#0a74da',
          margin: [0, 0, 0, 10],
        },
        user: {
          fontSize: 12,
          italics: true,
          alignment: 'right',
        },
        title: { fontSize: 16, bold: true, margin: [0, 0, 0, 10] },
        tableHeader: { bold: true, fontSize: 12, color: '#333' },
        footer: {
          fontSize: 10,
          italics: true,
          color: '#666',
          alignment: 'right',
        },
        thankYou: {
          fontSize: 12,
          bold: true,
          color: '#0a74da',
          alignment: 'center',
          margin: [0, 5, 0, 0],
        },
      },
      defaultStyle: { font: 'Roboto', fontSize: 11 },
    };

    const pdfDoc = printer.createPdfKitDocument(docDefinition);

    const exportDir = join(process.cwd(), 'exports');
    if (!fs.existsSync(exportDir)) fs.mkdirSync(exportDir);

    const filePath = join(exportDir, `transactions-${userId}.pdf`);
    const fileStream = fs.createWriteStream(filePath);
    pdfDoc.pipe(fileStream);
    pdfDoc.end();

    return new Promise((resolve) => {
      fileStream.on('finish', () => resolve(filePath));
    });
  }
}
