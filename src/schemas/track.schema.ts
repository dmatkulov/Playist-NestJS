import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Album } from './album.schema';
import mongoose, { Document } from 'mongoose';

@Schema()
export class Track {
  @Prop({ ref: Album.name, required: true })
  album: mongoose.Schema.Types.ObjectId;

  @Prop({
    required: true,
  })
  title: string;

  @Prop({
    required: true,
  })
  duration: string;
}

export type TrackDocument = Track & Document;

export const TrackSchema = SchemaFactory.createForClass(Track);
