import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { User } from './user.schema';

@Schema()
export class Artist {
  @Prop({ ref: User.name, required: true })
  user: mongoose.Schema.Types.ObjectId;

  @Prop({
    required: true,
    unique: true,
  })
  name: string;

  @Prop()
  about: string;

  @Prop()
  cover: string;
}

export const ArtistSchema = SchemaFactory.createForClass(Artist);

export type ArtistDocument = Artist & Document;
