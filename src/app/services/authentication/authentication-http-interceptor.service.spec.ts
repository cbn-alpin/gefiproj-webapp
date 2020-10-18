import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RouterStateSnapshot } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { JwtModule } from '@auth0/angular-jwt';
import { tokenGetter } from 'src/app/app.module';
import { NavigationService } from '../navigation.service';
import { AuthenticationHttpInterceptorService } from './authentication-http-interceptor.service';

describe('AuthenticationHttpInterceptorService', () => {
  let service: AuthenticationHttpInterceptorService;
  const mockSnapshot = jasmine.createSpyObj<RouterStateSnapshot>(
    'RouterStateSnapshot',
    ['toString']);

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
        JwtModule.forRoot({
          config: {
            tokenGetter
          }
        })
      ],
      providers: [
        NavigationService,
        {
          provide: RouterStateSnapshot,
          useValue: mockSnapshot
        }
      ]
    });
    service = TestBed.inject(AuthenticationHttpInterceptorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
