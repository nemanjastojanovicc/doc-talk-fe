import { Account, Role } from 'models';

export default {
  checkRolesForAccount(account: Account, roles: Role[], atLeastOne = true) {
    const accountRoles =
      account?.roles && account.roles.length > 0
        ? account.roles
        : account?.role
          ? [account.role]
          : [];

    return accountRoles[atLeastOne ? 'some' : 'every']((role) =>
      roles.includes(role),
    );
  },
};
