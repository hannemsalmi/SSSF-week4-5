import {UserIdWithToken} from './User';

export default interface AuthMessageResponse {
  message: string;
  user: UserIdWithToken | UserIdWithToken[];
}