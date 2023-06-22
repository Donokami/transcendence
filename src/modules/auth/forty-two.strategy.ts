import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-42';
import { AuthService } from './auth.service';

@Injectable()
export class FortyTwoStrategy extends PassportStrategy(Strategy, '42') {
  constructor(private authService: AuthService) {
    super({
      clientID: process.env.FORTYTWO_APP_ID,
      clientSecret: process.env.FORTYTWO_APP_SECRET,
      callbackURL: 'http://localhost:3000/api/auth/42/callback',
      profileFields: {
        id: function (obj) {
          return String(obj.id);
        },
        username: 'login',
        'emails.0.value': 'email',
        'photos.0.value': 'profile_picture',
      },
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any) {
    const {
      username,
      emails: [{ value: email }],
      _json: {
        image: { link: profile_picture },
      },
    } = profile;

    const user = await this.authService.validateUser({
      username,
      email,
      profile_picture,
    });

    return user || null;
  }
}
