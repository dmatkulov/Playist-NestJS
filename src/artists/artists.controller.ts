import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Req,
  UnprocessableEntityException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Artist, ArtistDocument } from '../schemas/artist.schema';
import mongoose, { Model } from 'mongoose';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateArtistDto } from './create-artist.dto';
import { TokenAuthGuard } from '../auth/token-auth.guard';
import { Roles } from '../decorators/roles.decorator';
import { Role } from '../enums/role.enum';
import { RolesGuard } from '../auth/roles-guard.guard';
import { UserDocument } from '../schemas/user.schema';
import { diskStorage } from 'multer';
import * as path from 'path';
import { randomUUID } from 'crypto';

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

  @Roles(Role.User)
  @UseGuards(TokenAuthGuard, RolesGuard)
  @Post()
  @UseInterceptors(
    FileInterceptor('cover', {
      storage: diskStorage({
        destination: './public/uploads/',
        filename: (_req, file, cb) => {
          const extension = path.extname(file.originalname);
          const filename = path.join('artists', randomUUID() + extension);
          cb(null, filename);
        },
      }),
    }),
  )
  create(
    @UploadedFile() file: Express.Multer.File,
    @Body() artistData: CreateArtistDto,
    @Req() req: Request & { user: UserDocument },
  ) {
    try {
      const artist = new this.artistModel({
        user: req.user._id,
        name: artistData.name,
        about: artistData.about,
        cover: file ? file.filename : null,
      });

      return artist.save();
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
    this.artistModel.findByIdAndDelete(id);
  }
}
