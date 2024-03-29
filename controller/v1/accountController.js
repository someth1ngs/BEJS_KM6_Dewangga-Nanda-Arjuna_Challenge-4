const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

module.exports = {
  store: async (req, res, next) => {
    try {
      let { bank_name, bank_account_number, balance, account_id } = req.body;

      let exist = await prisma.account.findUnique({
        where: { id: account_id },
      });

      if (!exist) {
        return res.status(404).json({
          status: false,
          message: `account dengan id ${account_id} tidak dapat ditemukan`,
        });
      }

      let account = await prisma.bank_Account.create({
        data: {
          bank_name,
          bank_account_number,
          balance,
          account: {
            connect: { id: account_id },
          },
        },
        include: {
          account: true,
        },
      });

      res.status(201).json({
        status: true,
        message: "OK",
        data: account,
      });
    } catch (error) {
      next(error);
    }
  },

  index: async (req, res, next) => {
    try {
      let accounts = await prisma.bank_Account.findMany();

      res.status(200).json({
        status: true,
        message: "OK",
        data: accounts,
      });
    } catch (error) {
      next(error);
    }
  },

  show: async (req, res, next) => {
    try {
      let accountId = Number(req.params.id);
      let account = await prisma.bank_Account.findUnique({
        where: { id: accountId },
        include: {
          user: {
            include: {
              profile: true,
            },
          },
        },
      });

      if (!account) {
        return res.status(400).json({
          status: false,
          message: "Akun tidak ditemukan dengan id Akun " + accountId,
        });
      }

      res.status(200).json({
        status: true,
        message: "OK",
        data: account,
      });
    } catch (error) {
      next(error);
    }
  },
};
