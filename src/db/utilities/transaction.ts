import { Transaction } from "sequelize";
import sequelize from "../database";

export type TransactionCallback<T> = (transaction: Transaction) => Promise<T>;

/**
 * Execute a callback within a database transaction
 * Automatically commits on success and rolls back on error
 */
export async function withTransaction<T>(
  callback: TransactionCallback<T>
): Promise<T> {
  const transaction = await sequelize.transaction();

  try {
    const result = await callback(transaction);
    await transaction.commit();
    return result;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}
