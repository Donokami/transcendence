<div align="center">
  <img src="https://raw.githubusercontent.com/Donokami/transcendence/master/frontend/public/favicon.ico" alt="transcendence logo" height="100" width="100">
  <h1>Transcendence</h1>
</div>

<p align="center">
  <i>Built by abastos, agirardi, llethuil and tjolivet.</i>
</p>

<br/>

<p>
This project was about creating a web platform for real-time pong games, featuring a NestJS and TypeORM-powered backend, a Vue.js-driven frontend, and Three.js for 3D game rendering. It incorporates PostgreSQL for data management, supports OAuth sign-ins, includes a real-time chat feature, and ensures secure, Docker-based deployment.
</p>

<br/>

## :camera: Screenshots

<p align="center">
  <img width="49%" src="https://github.com/Donokami/transcendence/assets/95182577/0af4be50-55b6-45e1-a260-c75b3f122ca1" alt="home"/>
&nbsp;
  <img width="49%" src="https://github.com/Donokami/transcendence/assets/95182577/1c7fcfcf-15ff-4cee-80d8-6459d77a9617" alt="chat"/>
</p>

<p align="center">
    <img width="49%" src="https://github.com/Donokami/transcendence/assets/95182577/16116394-3ae5-45b8-9ee4-592f7e017193" alt="game"/>
&nbsp;
    <img width="49%" src="https://github.com/Donokami/transcendence/assets/95182577/54f0ab93-cde0-466c-be30-a60cc9c86228" alt="game_room"/>
</p> 

<p align="center">
  <img width="49%" src="https://github.com/Donokami/transcendence/assets/95182577/6b2ec2a9-4a18-4e9d-8631-f5dc3913e22b" alt="login"/>
&nbsp;
  <img width="49%" src="https://github.com/Donokami/transcendence/assets/95182577/3cf13e69-9d43-48e0-8e93-0a77ebf2327f alt="profile"/>
</p>

<br/>

## :hammer_and_wrench: Tech Stack

```md
- NestJS
- Vue 3
- Typescript
- Vite
- TypeORM
- Socket.IO
- Postgresql
- TresJS
- ThreeJS
- TailwindCSS
- DaisyUI
- Iconify
- Docker
- Nginx
```

<br/>

## :gear: Installation
Before starting, create a `.env` file with the necessary values. Refer to the `.env.sample` file for an example of the required variables.

| Variable                     | Description                                                                       |
|------------------------------|-----------------------------------------------------------------------------      |
| `FRONT_URL`                  | URL for the frontend server, typically `http://localhost` for local development.  |
| `BACK_URL`                   | URL for the backend server, usually the same as `FRONT_URL` for local setups.     |
| `EXTERNAL_PORT`              | The port on which the backend server listens on the host.                         |
| `DB_USER`                    | Username for the PostgreSQL database.                                             |
| `DB_NAME`                    | Name of the PostgreSQL database.                                                  |
| `DB_PASSWORD`                | Strong password for the PostgreSQL database.                                      |
| `COOKIE_SESSION_KEY`         | Private key for generating secure session cookies.                                |
| `FORTYTWO_APP_REDIRECT_URI`  | Redirect URI for 42 API OAuth authentication; must match the 42 API settings.     |
| `FORTYTWO_APP_ID`            | Application ID for the 42 API.                                                    |
| `FORTYTWO_APP_SECRET`        | Secret key for the 42 API application.                                            |

<br/>

To start the project, run the following Docker commands:

```shell
docker compose build
docker compose up
```
⚠️ **Warning! You need a docker installation that supports uid/gid map**
