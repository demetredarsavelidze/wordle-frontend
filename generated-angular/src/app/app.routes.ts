import { Routes } from '@angular/router';

import { authGuard } from './guards/auth.guard';
import { GameComponent } from './pages/game/game.component';
import { HistoryComponent } from './pages/history/history.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { StatisticsComponent } from './pages/statistics/statistics.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'game' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'game', component: GameComponent, canActivate: [authGuard] },
  { path: 'statistics', component: StatisticsComponent, canActivate: [authGuard] },
  { path: 'history', component: HistoryComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: 'game' }
];
