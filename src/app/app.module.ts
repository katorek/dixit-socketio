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
import { UsernameDialogComponent } from './dialogs/username/username-dialog.component';
import {MatDialogModule} from '@angular/material/dialog';

const routes: Routes = [
  {path: '', component: HomeComponent},
  {path: 'lobby/:lobbyName', component: LobbyComponent},
  {path: '**', redirectTo: '/', pathMatch: 'full'}

];

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    LobbyComponent,
    UsernameDialogComponent
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
    MatDialogModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
