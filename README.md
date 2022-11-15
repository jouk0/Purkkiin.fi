# Purkkiin.fi

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 12.2.6.

## From start

Run `npm install`.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

When developing please change environment configure to your own backend server address.

## Backend server

Fill out .env file.

To build production run `npm run production`. Move files from dist/mp3ToVideo to backend mp3ToVideo folder.

To create https certificates run `certbot certonly` and move privkey.pem and fullchain.pem to backend cert folder.

Run `cd backend` and run `node server.js` on the backend folder.

## Dependencies
    * Redis server

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project.
Run `npm run production` to build production build.
The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.
