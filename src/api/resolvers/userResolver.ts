import {GraphQLError} from 'graphql';
import {Cat} from '../../interfaces/Cat';
import LoginMessageResponse from '../../interfaces/LoginMessageResponse';
import {User, UserIdWithToken} from '../../interfaces/User';
import fetchData from '../../functions/fetchData';
import AuthMessageResponse from '../../interfaces/AuthMessageResponse';
import MessageResponse from '../../interfaces/MessageResponse';

export default {
  Cat: {
    owner: async (parent: Cat) => {
      const ownerString = parent.owner.toString();
      const owner = await fetchData<AuthMessageResponse>(
        `${process.env.AUTH_URL}/users/${ownerString}`
      );
      return owner.user;
    },
  },
    Query: {
      users: async () => {
        const users = await fetchData<AuthMessageResponse>(
          `${process.env.AUTH_URL}/users`
        );
        return users.user;
      },
      userById: async (_parent: undefined, args: { id: string }) => {
        const user = await fetchData<AuthMessageResponse>(
          `${process.env.AUTH_URL}/users/${args.id}`
        );
        return user.user;
      },
    },
  
    Mutation: {
      login: async (_parent: undefined, args: { credentials: { username: string, password: string } }) => {
        const options: RequestInit = {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({email: args.credentials.username, password: args.credentials.password}),
        };
  
        const user = await fetchData<LoginMessageResponse>(
          `${process.env.AUTH_URL}/auth/login`,
          options
        );
        return user;
      },
      register: async (_parent: undefined, args: {user: User}) => {
        const options: RequestInit = {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify(args.user),
        };
  
        const response = await fetchData<MessageResponse>(
          `${process.env.AUTH_URL}/users`,
          options
        );
          return response;
      },
  
      updateUser: async (_parent: undefined, args: { user: User }, userToken: UserIdWithToken) => {
        try {
          const options: RequestInit = {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${userToken.token}` },
            body: JSON.stringify(args.user),
          };
          const user = await fetchData<LoginMessageResponse>(
            `${process.env.AUTH_URL}/users/`,
            options
          );            
          return user;
      
        } catch (error) {
          throw new GraphQLError('User not updated.');
        }
      },
      
  
    deleteUser: async (_parent: undefined, args: { user: User }, userToken: UserIdWithToken) => {
        const options: RequestInit = {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${userToken.token}` },
          body: JSON.stringify(args.user),
        };
      const user = await fetchData(`${process.env.AUTH_URL}/users/`, options);
      return user;
    },

   
     updateUserAsAdmin: async (_parent: undefined, args: { user: User, id: string }, userToken: UserIdWithToken) => {
      if (userToken.role !== 'admin') {
        throw new GraphQLError('Unauthorized: Only admins can update users.');
      }

      const options: RequestInit = {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(args.user),
      };

      const user = await fetchData(`${process.env.AUTH_URL}/users/`, options);
      return user;
    },
    deleteUserAsAdmin: async (_parent: undefined, args: { id: string }, userToken: UserIdWithToken) => {
      if (userToken.role !== 'admin') {
        throw new GraphQLError('Unauthorized: Only admins can delete users');
      }
    
      const options: RequestInit = {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${userToken.token}` },
        body: JSON.stringify({ userId: args.id }),
      };
    
      const deletedUser = await fetchData(`${process.env.AUTH_URL}/users/`, options);
      return deletedUser;
    },
    

  }, 
};

