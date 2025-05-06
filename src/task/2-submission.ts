import {getOrcaClient} from '@_koii/task-manager/extensions';
import {namespaceWrapper, TASK_ID} from '@_koii/namespace-wrapper';
import {createHash} from 'crypto';
import {storeFile} from '../helpers.js';

export async function submission(roundNumber: number): Promise<string | void> {
  console.log(`FETCH SUBMISSION FOR ROUND ${roundNumber}`);
  try {
    const orcaClient = await getOrcaClient();
    const result = await orcaClient.podCall(`submission/${roundNumber}`);

    const submission = result.data;

    // if you are writing a KPL task, use namespaceWrapper.getSubmitterAccount("KPL");
    const stakingKeypair = await namespaceWrapper.getSubmitterAccount();
    if (!stakingKeypair) throw new Error('Failed to get staking keypair');
    const stakingKey = stakingKeypair.publicKey.toBase58();

    // sign the submission
    const signature = await namespaceWrapper.payloadSigning(
      {
        taskId: TASK_ID,
        roundNumber: roundNumber,
        stakingKey: stakingKey,
        ...submission,
      },
      stakingKeypair.secretKey,
    );

    // store the submission on IPFS
    const cid = await storeFile({signature}, 'submission.json');
    console.log('SUBMISSION CID:', cid);
    return cid;
  } catch (error) {
    console.error('FETCH SUBMISSION ERROR:', error);
  }
}
