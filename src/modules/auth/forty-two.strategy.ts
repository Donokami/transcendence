import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-42';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FortyTwoStrategy extends PassportStrategy(Strategy, '42') {
  constructor(private readonly authService: AuthService, private readonly configService: ConfigService) {
    super({
      clientID: configService.get('FORTYTWO_APP_ID'),
      clientSecret: configService.get('FORTYTWO_APP_SECRET'),
      callbackURL: configService.get('FORTYTWO_APP_REDIRECT_URI'),
      profileFields: {
        id: function (obj) {
          return String(obj.id);
        },
        username: 'login',
        'emails.0.value': 'email',
        'photos.0.value': 'profilePicture',
      },
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any) {
    const {
      username,
      emails: [{ value: email }],
      _json: {
        image: { link: profilePicture },
      },
    } = profile;

    const user = await this.authService.validateUser({
      username,
      email,
      profilePicture,
    });

    return user || null;
  }
}
