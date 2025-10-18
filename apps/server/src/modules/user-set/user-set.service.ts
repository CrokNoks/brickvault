import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserSet } from '../../common/entities/user-set.schema';

@Injectable()
export class UserSetService {
  constructor(@InjectModel('UserSet') private userSetModel: Model<UserSet>) {}

  async assignSetToUser(userId: string, setRef: string, quantity = 1) {
    return this.userSetModel.create({
      user: userId,
      setRef,
      quantity,
      addedAt: new Date(),
    });
  }

  async getUserSets(userId: string) {
    return this.userSetModel.find({ user: userId }).populate('setRef').exec();
  }

  async removeSetFromUser(userId: string, setRef: string) {
    return this.userSetModel.deleteOne({ user: userId, setRef }).exec();
  }
}
