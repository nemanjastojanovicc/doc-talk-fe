import { Account, Role } from 'models';

export default {
  checkRolesForAccount(account: Account, roles: Role[], atLeastOne = true) {
    return account.roles?.[atLeastOne ? 'some' : 'every']((role) =>
      roles.includes(role),
    );
  },
};
