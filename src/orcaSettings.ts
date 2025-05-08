import {TASK_ID, namespaceWrapper} from '@_koii/namespace-wrapper';
const podId = TASK_ID;
import 'dotenv/config';

const imageURL = 'ghcr.io/aydoai/aydo-koii-myst-pod:latest';

async function createPodSpec() {
    const basePath = await namespaceWrapper.getBasePath();
    /** EXAMPLE PODSPEC
     *
     * NOTES:
     * The spacing is critical in YAML files
     * We recommend validating your podSpec with a tool like https://www.yamllint.com/
     * Use a template literal (``) to preserve whitespace
     * Do not change containers > name
     * You must specify your container image in the podSpec
     */
    const podSpec = `apiVersion: v1
kind: Pod
metadata:
  name: 247-builder-test
spec:
  containers:
    - name: user-${podId}
      image: ${imageURL}
      env:
        - name: MYST_API_KEY
          value: "${process.env.MYST_API_KEY}"
      ports:
        - containerPort: 4449
          hostPort: 4449
          protocol: TCP
        - containerPort: 8080
          hostPort: 8080
          protocol: TCP
      volumeMounts:
        - name: data-mysterium
          mountPath: /root/.mysterium
  volumes:
    - name: data-mysterium
      hostPath:
        path: ${basePath}/orca/aydo/.mysterium
        type: DirectoryOrCreate
`;
    return podSpec;
}

export async function getConfig() {
    return {
        imageURL: imageURL,
        // if you don't need to use a podSpec, you can set customPodSpec to null
        customPodSpec: await createPodSpec(),
        rootCA: null,
    };
}
