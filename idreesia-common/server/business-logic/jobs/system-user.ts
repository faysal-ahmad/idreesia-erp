declare const Accounts: {
  findUserByUsername(userName?: string): Promise<{ _id: string } | null>;
};

// erp-system is created (passwordless, on purpose) by migration 47 -
// see idreesia-web/imports/startup/server/migrations/47-create-system-user.ts
export async function getSystemUser(): Promise<{ _id: string }> {
  const systemUser = await Accounts.findUserByUsername('erp-system');
  if (!systemUser) {
    throw new Error(
      "erp-system user not found - has migration 47 run against this database?"
    );
  }

  return { _id: systemUser._id };
}
