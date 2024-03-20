import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Track, TrackDocument } from '../schemas/track.schema';
import { Model, Types } from 'mongoose';
import { CreateTrackDto } from './create-track.dto';

@Controller('tracks')
export class TracksController {
  constructor(
    @InjectModel(Track.name)
    private trackModel: Model<TrackDocument>,
  ) {}

  @Get()
  getAll(@Query('albumId') albumId: string) {
    try {
      new Types.ObjectId(albumId);
    } catch {
      return { error: 'Wrong Object ID' };
    }

    if (albumId) {
      return this.trackModel.find({ album: albumId });
    } else {
      return this.trackModel.find();
    }
  }

  @Post()
  create(@Body() trackData: CreateTrackDto) {
    const track = new this.trackModel({
      album: trackData.album,
      title: trackData.title,
      duration: trackData.duration,
    });

    return track.save();
  }

  @Delete('id')
  async deleteOne(@Param('id') id: string) {
    await this.trackModel.findByIdAndDelete(id);
  }
}
