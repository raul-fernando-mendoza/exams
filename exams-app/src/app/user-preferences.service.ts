import { Injectable } from '@angular/core';

import { db } from  'src/environments/environment';
import { Organization } from './exams/exams.module';

@Injectable({
  providedIn: 'root'
})
export class UserPreferencesService {

  constructor() { }

  setCurrentOrganizationId(organizationID){
    localStorage.setItem('organizationId', organizationID)    
  }

  getCurrentOrganizationId(){
    return localStorage.getItem('organizationId')
  }


}
