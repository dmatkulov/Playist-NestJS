import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
  UnprocessableEntityException,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Album, AlbumDocument } from '../schemas/album.schema';
import mongoose, { Model, Types } from 'mongoose';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateAlbumDto } from './create-album.dto';

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

  @Post()
  @UseInterceptors(
    FileInterceptor('cover', { dest: './public/uploads/albums' }),
  )
  create(
    @UploadedFile() file: Express.Multer.File,
    @Body() albumData: CreateAlbumDto,
  ) {
    try {
      const album = new this.albumModel({
        artist: albumData.artist,
        title: albumData.title,
        yearOfRelease: parseInt(albumData.yearOfRelease),
        cover: file ? '/uploads/albums/' + file.filename : null,
      });

      return album.save();
    } catch (e) {
      if (e instanceof mongoose.Error.ValidationError) {
        throw new UnprocessableEntityException(e);
      }

      throw e;
    }
  }

  @Delete(':id')
  async deleteOne(@Param('id') id: string) {
    await this.albumModel.findByIdAndDelete(id);
  }
}
