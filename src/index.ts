import cron from 'node-cron';
import { Client, ClientCredentials, EngineState } from '@relationalai/rai-sdk-javascript';
import type { Engine } from '@relationalai/rai-sdk-javascript';

async function cleanupEngines() {
  const credentials = new ClientCredentials(
    process.env.RAI_CLIENT_ID as string,
    process.env.RAI_CLIENT_SECRET as string,
    'https://login.relationalai.com/oauth/token',
  );
  const config = {
    credentials,
    host: 'azure.relationalai.com',
    scheme: 'https',
    port: '443',
  };
  const client = new Client(config);

  const transactions = await client.listTransactions();
  const lastUsed: {[engineName: string]: number} = {};
  for (let transaction of transactions) {
    lastUsed[transaction.engine_name] = Math.max(
      (lastUsed[transaction.engine_name] || 0),
      transaction.created_on || 0
    );
  }
  
  const engines = await client.listEngines({
    state: EngineState.PROVISIONED,
  });
  const distinctEngines = [...(new Set(engines.map((engine: Engine) => engine.name)))] 
  const now = Date.now();
  for (let engine of distinctEngines) {
    // last used less than six hours ago:
    if (engine in lastUsed && lastUsed[engine] > now - 1000 * 60 * 60 * 6) {
      continue;
    }
    console.log(`Would delete engine ${engine}`);
    //await client.deleteEngine(engine);
  }
}

cron.schedule(`0 * * * *`, cleanupEngines);