import {getOrcaClient} from '@_koii/task-manager/extensions';

export async function task(roundNumber: number): Promise<void> {
  try {
    console.log(`EXECUTE TASK FOR ROUND ${roundNumber}`);

    const orcaClient = await getOrcaClient();
    await orcaClient.podCall(`task/${roundNumber}`, {method: 'POST'});
  } catch (error) {
    console.error("EXECUTE TASK ERROR:", error);
  }
}
