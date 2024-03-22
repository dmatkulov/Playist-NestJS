import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  UnprocessableEntityException,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Artist, ArtistDocument } from '../schemas/artist.schema';
import mongoose, { Model } from 'mongoose';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateArtistDto } from './create-artist.dto';

@Controller('artists')
export class ArtistsController {
  constructor(
    @InjectModel(Artist.name)
    private artistModel: Model<ArtistDocument>,
  ) {}

  @Get()
  getAll() {
    return this.artistModel.find();
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    const artist = await this.artistModel.findById(id);

    if (!artist) {
      throw new NotFoundException('Artist not found!');
    }

    return artist;
  }

  @Post()
  @UseInterceptors(
    FileInterceptor('cover', { dest: './public/uploads/artists' }),
  )
  create(
    @UploadedFile() file: Express.Multer.File,
    @Body() artistData: CreateArtistDto,
  ) {
    try {
      const artist = new this.artistModel({
        name: artistData.name,
        about: artistData.about,
        cover: file ? '/uploads/artists/' + file.filename : null,
      });

      return artist.save();
    } catch (e) {
      if (e instanceof mongoose.Error.ValidationError) {
        throw new UnprocessableEntityException(e);
      }

      throw e;
    }
  }

  @Delete(':id')
  async deleteOne(@Param('id') id: string) {
    await this.artistModel.findByIdAndDelete(id);
  }
}
