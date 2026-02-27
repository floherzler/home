import { Account, Client, Storage, TablesDB } from "appwrite";
import { env } from "./env";

const client = new Client();

if (env.endpoint) {
  client.setEndpoint(env.endpoint);
}

if (env.projectId) {
  client.setProject(env.projectId);
}

const account = new Account(client);
const tablesDB = new TablesDB(client);
const storage = new Storage(client);

export { account, client, storage, tablesDB };
