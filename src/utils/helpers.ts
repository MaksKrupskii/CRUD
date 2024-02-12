import { User } from 'types/user-type';

type Fields = Omit<User, 'id'>;

export function hasAllFields(obj: Fields) {
  const fields = ['username', 'age', 'hobbies'];
  for (const field of fields) {
    if (!(field in obj)) {
      return false;
    }
  }
  return true;
}
