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

  async function lastUsed(engine_name: string) {
    const transactions = await client.listTransactions({
      engine_name
    });
    let lastUsed: number = 0;
    for (let transaction of transactions) {
      lastUsed = Math.max(
        (lastUsed || 0),
        transaction.created_on || 0
      );
    }
    return lastUsed;
  }
  
  const engines = await client.listEngines({
    state: EngineState.PROVISIONED,
  });
  const distinctEngines = [...(new Set(engines.map((engine: Engine) => engine.name)))];
  const now = Date.now();
  console.log(`${new Date(now)} ${distinctEngines.length} provisioned engines: `, distinctEngines.join(", "));
  for (let engine of distinctEngines) {
    if (engine === "raidocs-parser-engine"  || engine === "raidocs-team") continue;
    // last used less than six hours ago:
    const lastUsedTime = await lastUsed(engine);
    const hoursAgo = (now - lastUsedTime) / (1000 * 60 * 60);
    if (hoursAgo < 24) continue;
    console.log(`Deleting engine ${engine}`);
    await client.deleteEngine(engine);
  }
}

// every hour:
cron.schedule(`0 * * * *`, cleanupEngines);