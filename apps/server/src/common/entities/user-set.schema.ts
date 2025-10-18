import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class UserSet extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: string;

  @Prop({ type: Types.ObjectId, ref: 'Set', required: true })
  setRef: string;

  @Prop({ default: 1 })
  quantity: number;

  @Prop()
  addedAt: Date;
}

export const UserSetSchema = SchemaFactory.createForClass(UserSet);
