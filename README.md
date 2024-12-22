# Einbinden

Einbinden is an online book collection tracker plugged to official databases.

## Features

- Automatic data gathering from **GoogleBooks**, **inventaire.io** and **bnf.fr**.
- ISBN scanning (available on chromium browsers only)
- Book editing
- Sharing collection through URL
- Authentication through github SSO

## Installation

The project is split in two parts: **server** and **app**.

Install both projects using `npm install` in both folders `src/server` and `src/app`.

Additionnaly, a **MongoDB** server needs to be available with a database named `Einbinden`. Then execute the script `src/docker/mongo-init.js` on that MongoDB server to create collections and indexes.

## Usage

To use the app locally:

In `src/server`, copy `.env.template` as `.env` and fill in the information.
Launch the server using `npm run dev` in the directory. You can check that the server is launched by requesting the `/ebd/test` GET endpoint.

Launch the app using `npm run start` in the `src/app` directory. Make sure the API_URL constant is correct (`src/app/src/config.ts`). The app should automatically open in your browser of choice.

## Deployment

This project is very similar to [MaiteInThePocket](https://github.com/raza6/MaiteInThePocket). Please refer to its deployment section.

## Authors and acknowledgment

Einbinden has been developed by [@raza6](https://github.com/raza6).

Both server and app are built with TypeScript.

Server :
  - [express](https://www.npmjs.com/package/express)
  - [mongodb](https://www.npmjs.com/package/mongodb)
  
App : 
  - [React](https://www.npmjs.com/package/react)
  - [Bootstrap](https://getbootstrap.com/)


## License

[CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/legalcode)