import {GraphQLError} from 'graphql';
import {Cat} from '../../interfaces/Cat';
import {locationInput} from '../../interfaces/Location';
import {UserIdWithToken} from '../../interfaces/User';
import rectangleBounds from '../../utils/rectangleBounds';
import catModel from '../models/catModel';
import {Types} from 'mongoose';

export default {
  Query: {
    cats: async () => {
      return await catModel.find();
    },
    catById: async (_parent: undefined, args: { id: Types.ObjectId }) => {
      return await catModel.findById(args.id);
    },
    catsByArea: async (_parent: undefined, args: locationInput) => {
      const bounds = rectangleBounds(args.topRight, args.bottomLeft);

      return await catModel.find({
        location: {
          $geoWithin: {
            $geometry: bounds,
          },
        },
      });
    },
    catsByOwner: async (_parent: undefined, args: { ownerId: Types.ObjectId }) => {
      return await catModel.find({ owner: args.ownerId });
    },
  },
  Mutation: {
    createCat: async (_parent: undefined, args: Cat, user: UserIdWithToken) => {
      if (!user.id) {
        throw new GraphQLError('Authorization required');
      }

      args.owner = user.id as unknown as Types.ObjectId;
      const cat = new catModel(args);
      return await cat.save();
    },
    updateCat: async (_parent: undefined, args: Cat, user: UserIdWithToken) => {
      if (!user.id) {
        throw new GraphQLError('Authorization required');
      }

      const cat = await catModel.findById(args.id);

      if (!cat) {
        throw new GraphQLError('No cat found with provided ID');
      }
      if (cat.owner.toString() !== user.id) {
        throw new GraphQLError('User is not the owner of the specified cat');
      }

      return await catModel.findByIdAndUpdate(args.id, args, { new: true });
    },
    deleteCat: async (_parent: undefined, args: { id: Types.ObjectId }, user: UserIdWithToken) => {
      if (!user.id) {
        throw new GraphQLError('Authorization required');
      }

      const cat = await catModel.findById(args.id);
      if (!cat) {
        throw new GraphQLError('No cat found with provided ID');
      }
      if (cat.owner.toString() !== user.id) {
        throw new GraphQLError('User is not the owner of the specified cat');
      }

      return await catModel.findByIdAndDelete(args.id);
    },
    updateCatAsAdmin: async (_parent: undefined, args: Cat, user: UserIdWithToken) => {
      if (user.role !== 'admin') {
        throw new GraphQLError('Admin rights required for this action');
      }
      return await catModel.findByIdAndUpdate(args.id, args, { new: true });
    },
    deleteCatAsAdmin: async (_parent: undefined, args: { id: Types.ObjectId }, user: UserIdWithToken) => {
      if (user.role !== 'admin') {
        throw new GraphQLError('Admin rights required for this action');
      }
      return await catModel.findByIdAndDelete(args.id);
    },
  },
};
