# ExamsApp
#to execute use
npm start
#helpful commands
firebase help
firebase login
firebase projects:list  

# use the followng to select the hosting option.
firebase projects:list
firebase use <project_id>
firebase init


#use to deploy the app first compile for deployment
ng build --configuration="production"
firebase deploy



#use to run the emulator activate the emulator mode in environment.ts
firebase init
firebase emulators:start
firebase use <project_id>
also check the default project in .firebaserc


#to use http requests on storage use the cloud shell to create a file called cors.json with this content:
[
    {
      "origin": ["*"],
      "method": ["GET"],
      "maxAgeSeconds": 3600
    }
]
#then run this command gsutil cors set cors.json gs://thoth-dev-346022.appspot.com



This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 11.0.3.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.
