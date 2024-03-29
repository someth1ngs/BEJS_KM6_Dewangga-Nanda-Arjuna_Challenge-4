const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

module.exports = {
  store: async (req, res, next) => {
    try {
      const { source_account_id, destination_account_id, amount } = req.body;

      const sourceAccount = await prisma.bank_Account.findUnique({
        where: { id: source_account_id },
      });

      const destinationAccount = await prisma.bank_Account.findUnique({
        where: { id: destination_account_id },
      });

      if (!sourceAccount || !destinationAccount) {
        return res
          .status(404)
          .json({ message: "Untuk pengirim atau penerima tidak valid" });
      }

      if (sourceAccount.balance < amount) {
        return res.status(400).json({ message: "Saldo tidak mencukupi" });
      }

      const transferTransaction = await prisma.$transaction([
        prisma.bank_Account.update({
          where: { id: source_account_id },
          data: { balance: { decrement: amount } },
        }),

        prisma.bank_Account.update({
          where: { id: destination_account_id },
          data: { balance: { increment: amount } },
        }),

        prisma.transaction.create({
          data: {
            amount,
            sourceAccounts: { connect: { id: source_account_id } },
            destinationAccounts: { connect: { id: destination_account_id } },
          },
        }),
      ]);

      res
        .status(200)
        .json({ message: "Transfer Sukses", data: transferTransaction[2] });
    } catch (error) {
      next(error);
    }
  },

  index: async (req, res, next) => {
    try {
      let transactions = await prisma.transaction.findMany();

      res.status(200).json({
        status: true,
        message: "OK",
        data: transactions,
      });
    } catch (error) {
      next(error);
    }
  },

  show: async (req, res, next) => {
    try {
      let transactionId = Number(req.params.id);
      let transaction = await prisma.transaction.findUnique({
        where: { id: transactionId },
        include: {
          sourceAccounts: true,
          destinationAccounts: true,
        },
      });

      if (!transaction) {
        return res.status(400).json({
          status: false,
          message:
            "transaksi tidak ditemukan dengan id Transaksi " + transactionId,
        });
      }

      res.status(200).json({
        status: true,
        message: "OK",
        data: transaction,
      });
    } catch (error) {
      next(error);
    }
  },
};
