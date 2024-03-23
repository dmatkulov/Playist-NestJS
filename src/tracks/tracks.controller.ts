import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  UnprocessableEntityException,
  UseGuards,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Track, TrackDocument } from '../schemas/track.schema';
import mongoose, { Model, Types } from 'mongoose';
import { CreateTrackDto } from './create-track.dto';
import { Roles } from '../decorators/roles.decorator';
import { Role } from '../enums/role.enum';
import { TokenAuthGuard } from '../auth/token-auth.guard';
import { RolesGuard } from '../auth/roles-guard.guard';
import { UserDocument } from '../schemas/user.schema';

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

  @Roles(Role.User)
  @UseGuards(TokenAuthGuard, RolesGuard)
  @Post()
  create(
    @Body() trackData: CreateTrackDto,
    @Req() req: Request & { user: UserDocument },
  ) {
    try {
      const track = new this.trackModel({
        user: req.user._id,
        album: trackData.album,
        title: trackData.title,
        duration: trackData.duration,
      });

      return track.save();
    } catch (e) {
      if (e instanceof mongoose.Error.ValidationError) {
        throw new UnprocessableEntityException(e);
      }

      throw e;
    }
  }

  @Roles(Role.Admin)
  @UseGuards(TokenAuthGuard, RolesGuard)
  @Delete('id')
  async deleteOne(@Param('id') id: string) {
    await this.trackModel.findByIdAndDelete(id);
  }
}
