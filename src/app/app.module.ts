import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppComponent} from './app.component';
import {FlexLayoutModule} from '@angular/flex-layout';
import {HomeComponent} from './home/home.component';
import {RouterModule, Routes} from '@angular/router';
import {AppMaterialModule} from './material/app-material.module';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatButtonModule} from '@angular/material/button';
import {LobbyComponent} from './lobby/lobby.component';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {ToastrModule} from 'ngx-toastr';
import {UsernameDialogComponent} from './dialogs/username/username-dialog.component';
import {MatDialogModule} from '@angular/material/dialog';
import {GameComponent} from './game/game.component';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {SWIPER_CONFIG, SwiperConfigInterface, SwiperModule} from 'ngx-swiper-wrapper';
import {Mousewheel} from 'swiper';
import {MatIconModule} from '@angular/material/icon';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatDividerModule} from '@angular/material/divider';
import {ClipboardModule} from '@angular/cdk/clipboard';
import {MatListModule} from '@angular/material/list';
// import {SwiperModule} from 'swiper/angular';
// import {IvyCarouselModule} from 'angular-responsive-carousel';

const routes: Routes = [
  {path: '', component: HomeComponent},
  {path: 'lobby/:lobbyName', component: LobbyComponent},
  {path: 'game/:gameName', component: GameComponent},
  {path: '**', redirectTo: '/', pathMatch: 'full'}

];

const DEFAULT_SWIPER_CONFIG: SwiperConfigInterface = {
  // direction: 'horizontal',
  // loop: true,
  // mousewheel: {forceToAxis: true}
  // loopAdditionalSlides: 1,
  // loopPreventsSlide: true,
  // slidesPerView: 3,
  // width: 400,
  // freeMode: true
  // loop: true,
};

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    LobbyComponent,
    UsernameDialogComponent,
    GameComponent
  ],
  imports: [
    BrowserModule,
    FlexLayoutModule,
    RouterModule.forRoot(routes),
    AppMaterialModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    ToastrModule.forRoot(),
    MatDialogModule,
    MatSlideToggleModule,
    SwiperModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    ClipboardModule,
    MatListModule,
    // IvyCarouselModule
  ],
  providers: [
    {
      provide: SWIPER_CONFIG,
      useValue: DEFAULT_SWIPER_CONFIG
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
