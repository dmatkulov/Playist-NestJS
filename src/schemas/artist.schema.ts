import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Artist {
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
