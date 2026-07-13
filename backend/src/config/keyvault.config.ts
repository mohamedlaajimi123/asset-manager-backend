import { SecretClient } from '@azure/keyvault-secrets';
import { DefaultAzureCredential } from '@azure/identity';

export async function loadKeyVaultSecrets() {
  const vaultUrl = process.env.AZURE_KEYVAULT_RESOURCEENDPOINT;
  
  if (!vaultUrl) {
    console.log('No Azure Key Vault endpoint found. Falling back to local env variables.');
    return {};
  }

  try {
    console.log(`Connecting to Azure Key Vault at: ${vaultUrl}`);
    
    const credential = new DefaultAzureCredential();
    const client = new SecretClient(vaultUrl, credential);

    // Watches the exact names created in the vault 
    const secretNames = [
      'DATABASE-URL',
      'JWT-SECRET',
      'AZURE-STORAGE-CONNECTION-STRING',
      'AZURE-CONTAINER-NAME',
      'AZURE-EMAIL-CONNECTION-STRING',
      'EMAIL-FROM-ADDRESS'
    ];

    const secrets: Record<string, string> = {};

    for (const name of secretNames) {
      try {
        const secret = await client.getSecret(name);
        const envKey = name.replace(/-/g, '_').toUpperCase();
        secrets[envKey] = secret.value || '';
      } catch (err :any) {
        console.warn(`Could not fetch secret "${name}" from Key Vault:`, err.message);
      }
    }

    console.log('Successfully loaded secrets from Azure Key Vault.');

    for (const [key, value] of Object.entries(secrets)) {
      process.env[key] = value;
    }

    return secrets;
  } catch (error : any) {
    console.error('Critical error connecting to Azure Key Vault:', error.message);
    return {};
  }
}