import { Client, Account, TablesDB } from "appwrite";

const config = {
  endpoint: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!,
  projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!,
  databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
  profilesTableId: process.env.NEXT_PUBLIC_APPWRITE_PROFILES_TABLE_ID!,

};

const client = new Client();

client
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);

export const account = new Account(client);


export const tablesDB = new TablesDB(client);

export { ID } from "appwrite";
export const appwriteConfig = config;


