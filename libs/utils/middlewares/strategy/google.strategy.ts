// import { IGoogleProfile, ISocialProfile } from '@lib/common/interfaces';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-google-oauth2';
import * as dotenv from 'dotenv';
dotenv.config();

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor() {
    super({
      clientID: process.env.GG_CLIENT_ID,
      clientSecret: process.env.GG_CLIENT_SECRET,
      callbackURL: process.env.GG_CALLBACK_URL,
      scope: ['email', 'profile'],
    });
  }

  async validate(
    _: string, // access token
    __: string, // refresh token
    profile: any,
  ): Promise<any> {
    const { id, email, name } = profile;
    const user: any = {
      id,
      email,
      name: `${name.familyName} ${name.givenName}`,
    };

    return user;
  }
}
