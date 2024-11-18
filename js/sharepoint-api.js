import dotenv from 'dotenv';
import { ClientSecretCredential } from "@azure/identity";
import { Client } from "@microsoft/microsoft-graph-client";
import { TokenCredentialAuthenticationProvider } from "@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials";

// Load environment variables
dotenv.config();

const tenantId = process.env.TENANT_ID;
const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const siteId = process.env.SITE_ID;

// Initialize the Microsoft Graph client
const credential = new ClientSecretCredential(tenantId, clientId, clientSecret);
const authProvider = new TokenCredentialAuthenticationProvider(credential, {
  scopes: ['https://graph.microsoft.com/.default']
});

const client = Client.initWithMiddleware({
  authProvider: authProvider
});

async function getSharePointLists() {
  try {
    const response = await client.api(`/sites/${siteId}/lists`)
      .get();
    console.log('SharePoint lists:', response.value);
  } catch (error) {
    console.error('Error fetching SharePoint lists:', error);
  }
}

getSharePointLists();