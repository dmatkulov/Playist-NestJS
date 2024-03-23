import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Artist } from './artist.schema';
import mongoose, { Document } from 'mongoose';
import { User } from './user.schema';

@Schema()
export class Album {
  @Prop({ ref: User.name, required: true })
  user: mongoose.Schema.Types.ObjectId;

  @Prop({ ref: Artist.name, required: true })
  artist: mongoose.Schema.Types.ObjectId;

  @Prop({
    required: true,
    unique: true,
  })
  title: string;

  @Prop({
    required: true,
  })
  yearOfRelease: number;

  @Prop()
  cover: string;
}

export type AlbumDocument = Album & Document;
export const AlbumSchema = SchemaFactory.createForClass(Album);
