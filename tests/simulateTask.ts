import { taskRunner } from "@_koii/task-manager";
import {bootstrap} from '@_koii/orca-node';
import "../src/index";
import { namespaceWrapper } from "@_koii/task-manager/namespace-wrapper";
import { Keypair } from "@_koii/web3.js";
import {execSync} from "child_process";

const numRounds = parseInt(process.argv[2]) || 100;
const roundDelay = parseInt(process.argv[3]) || 60000;
const functionDelay = parseInt(process.argv[4]) || 10000;

let TASK_TIMES: number[] = [];
let SUBMISSION_TIMES: number[] = [];
let AUDIT_TIMES: number[] = [];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const keypair = Keypair.generate();
await namespaceWrapper.stakeOnChain(keypair.publicKey, keypair, keypair.publicKey, 10000);

async function executeTasks() {
  const podStopCommand = `podman pod stop undefined`;
  const podRmCommand = `podman pod rm undefined`;
  try {
    execSync(podStopCommand);
    execSync(podRmCommand);
  } catch (error) {
    console.error(error.stderr);
  }
  const orcaInstance = await bootstrap();
  orcaInstance.setErrorHandler(msg => console.error('ORCA Error: ', msg));
  orcaInstance.setWarnHandler(msg => console.warn('ORCA Warning: ', msg));
  orcaInstance.setLogHandler(msg => console.log('ORCA: ', msg));

  console.log('Sleeping for initialize');
  await sleep(60000);

  for (let round = 0; round < numRounds; round++) {
    console.log('Round: ', round);
    
    const taskStartTime = Date.now();
    await taskRunner.task(round);
    const taskEndTime = Date.now();
    TASK_TIMES.push(taskEndTime - taskStartTime);

    console.log('Sleeping for step 1: ', functionDelay);
    await sleep(functionDelay);

    const taskSubmissionStartTime = Date.now();
    await taskRunner.submitTask(round);
    const taskSubmissionEndTime = Date.now();
    SUBMISSION_TIMES.push(taskSubmissionEndTime - taskSubmissionStartTime);

    console.log('Sleeping for step 2: ', functionDelay);
    await sleep(functionDelay);

    const auditStartTime = Date.now();
    await taskRunner.auditTask(round);
    const auditEndTime = Date.now();
    AUDIT_TIMES.push(auditEndTime - auditStartTime);

    console.log('Sleeping for step 3: ', functionDelay);
    await sleep(functionDelay);

    await taskRunner.selectAndGenerateDistributionList(round);

    console.log('Sleeping for step 4: ', functionDelay);
    await sleep(functionDelay);

    await taskRunner.auditDistribution(round);

    if (round < numRounds - 1) {
      console.log('Sleeping for round delay: ', roundDelay);
      await sleep(roundDelay);
    }
  }
  console.log("TIME METRICS BELOW");
  function metrics(name, times) {
    const average = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;
    const formatTime = (ms) => (ms / 1000).toFixed(4);
    const formatSlot = (ms) => Math.ceil(ms / 408);
    const min = Math.min(...times);
    const max = Math.max(...times);
    const avg = average(times);
    const timeMin = formatTime(min);
    const timeMax = formatTime(max);
    const timeAvg = formatTime(avg);
    const slotMin = formatSlot(min);
    const slotMax = formatSlot(max);
    const slotAvg = formatSlot(avg);

    return {
      Metric: `SIMULATED ${name} WINDOW`,
      "Avg Time (s)": timeAvg,
      "Avg Slots": slotAvg,
      "Min Time (s)": timeMin,
      "Min Slots": slotMin,
      "Max Time (s)": timeMax,
      "Max Slots": slotMax,
    };
  }
  const timeMetrics = metrics("TASK", TASK_TIMES);
  const submissionMetrics = metrics("SUBMISSION", SUBMISSION_TIMES);
  const auditMetrics = metrics("AUDIT", AUDIT_TIMES);

  console.table([timeMetrics, submissionMetrics, auditMetrics]);

  console.log("All tasks executed. Test completed.");
  process.exit(0);
}

setTimeout(executeTasks, 1500);

function deletePod() {
  function execSync(cmdstr) {
    try {
      execSync(cmdstr);
    } catch (error) {
      console.error(error);
    }
  }
  const podStopCommand = `podman pod stop undefined`;
  const podRmCommand = `podman pod rm undefined`;
  try {
    execSync(podStopCommand);
    execSync(podRmCommand);
  } catch (error) {
    console.error(error.stderr);
  }
}
