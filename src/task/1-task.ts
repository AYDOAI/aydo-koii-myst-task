import {getOrcaClient} from '@_koii/task-manager/extensions';

export async function task(roundNumber: number): Promise<void> {
  try {
    console.log(`EXECUTE TASK FOR ROUND ${roundNumber}`);

    const orcaClient = await getOrcaClient();
    const podResponse = await orcaClient.podCall(`task/${roundNumber}`, {method: 'POST'});
    console.log('POD RESPONSE:', podResponse);
  } catch (error) {
    console.log("EXECUTE TASK ERROR:", error);
  }
}
