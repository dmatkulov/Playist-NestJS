import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
  Req,
  UnprocessableEntityException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FileInterceptor } from '@nestjs/platform-express';
import * as path from 'path';
import { diskStorage } from 'multer';
import { randomUUID } from 'crypto';
import mongoose, { Model, Types } from 'mongoose';
import { Album, AlbumDocument } from '../schemas/album.schema';
import { CreateAlbumDto } from './create-album.dto';
import { Roles } from '../decorators/roles.decorator';
import { Role } from '../enums/role.enum';
import { TokenAuthGuard } from '../auth/token-auth.guard';
import { RolesGuard } from '../auth/roles-guard.guard';
import { UserDocument } from '../schemas/user.schema';

@Controller('albums')
export class AlbumsController {
  constructor(
    @InjectModel(Album.name)
    private albumModel: Model<AlbumDocument>,
  ) {}

  @Get()
  async getAll(@Query('artistId') artistId: string) {
    try {
      new Types.ObjectId(artistId);
    } catch {
      return { error: 'Wrong Object ID' };
    }

    if (artistId) {
      return this.albumModel.find({ artist: artistId });
    } else {
      return this.albumModel.find();
    }
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    const album = await this.albumModel.findById(id);

    if (!album) {
      throw new NotFoundException('Album not found!');
    }

    return album;
  }

  @Roles(Role.User)
  @UseGuards(TokenAuthGuard, RolesGuard)
  @Post()
  @UseInterceptors(
    FileInterceptor('cover', {
      storage: diskStorage({
        destination: './public/uploads/',
        filename: (_req, file, cb) => {
          const extension = path.extname(file.originalname);
          const filename = path.join('albums', randomUUID() + extension);
          cb(null, filename);
        },
      }),
    }),
  )
  create(
    @UploadedFile() file: Express.Multer.File,
    @Body() albumData: CreateAlbumDto,
    @Req() req: Request & { user: UserDocument },
  ) {
    try {
      const album = new this.albumModel({
        user: req.user._id,
        artist: albumData.artist,
        title: albumData.title,
        yearOfRelease: parseInt(albumData.yearOfRelease),
        cover: file ? file.filename : null,
      });

      return album.save();
    } catch (e) {
      if (e instanceof mongoose.Error.ValidationError) {
        throw new UnprocessableEntityException(e);
      }

      throw e;
    }
  }

  @Roles(Role.Admin)
  @UseGuards(TokenAuthGuard, RolesGuard)
  @Delete(':id')
  deleteOne(@Param('id') id: string) {
    this.albumModel.findByIdAndDelete(id);
  }
}
