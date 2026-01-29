import fs from 'fs'

import express, { Express, Request, Response } from 'express';

import { CS571Initializer, CS571InitOptions } from '@cs571/api-framework'
import HW9PublicConfig from './model/configs/hw9-public-config';
import HW9SecretConfig from './model/configs/hw9-secret-config';
import { CS571AllChatroomsRoute } from './routes/chatrooms';
import { CS571GetMessagesRoute } from './routes/get-messages';
import { CS571CreateMessageRoute } from './routes/create-message';
import { CS571DeleteMessageRoute } from './routes/delete-message';
import { CS571RegisterRoute } from './routes/register';
import { CS571LoginRoute } from './routes/login';
import { CS571WhoAmIRoute } from './routes/whoami';
import { CS571HW9DbConnector } from './services/hw9-db-connector';
import { CS571HW9TokenAgent } from './services/hw9-token-agent';
import { CS571PasswordsRoute } from './routes/passwords';

import cookies from 'cookie-parser'

console.log("Welcome to HW9!");

const app: Express = express();
app.use(cookies());

const appBundle = CS571Initializer.init<HW9PublicConfig, HW9SecretConfig>(app, new CS571InitOptions({
  middlewareBodyExtractor: (req: Request, res: Response) => {
    return typeof req.body === "object" ? (
      req.body.pin ?
        JSON.stringify({...req.body, pin: "[REDACTED]"}) :
        JSON.stringify(req.body)
      ) : (typeof req.body === "string" ? req.body : undefined)
  }
}));
const db = new CS571HW9DbConnector(appBundle.config);
const ta = new CS571HW9TokenAgent(appBundle.config);

db.init();

const chatrooms = JSON.parse(fs.readFileSync('includes/chatrooms.json').toString());
const passwords = JSON.parse(fs.readFileSync(appBundle.config.PUBLIC_CONFIG.PASSWORDS_LOC).toString());

appBundle.router.addRoutes([
  new CS571AllChatroomsRoute(chatrooms, db),
  new CS571GetMessagesRoute(chatrooms, db),
  new CS571CreateMessageRoute(chatrooms, db, ta),
  new CS571DeleteMessageRoute(db, ta),
  new CS571RegisterRoute(db, ta, appBundle.config),
  new CS571LoginRoute(db, ta, appBundle.config),
  new CS571WhoAmIRoute(db, ta),
  new CS571PasswordsRoute(passwords)
])

app.listen(appBundle.config.PORT, () => {
  console.log(`Running at :${appBundle.config.PORT}`);
});
