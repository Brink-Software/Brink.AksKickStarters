import * as k8s from "@pulumi/kubernetes";
import { k8sProvider } from "../cluster";
import env from "../../environment";

const { resourceGroup, currentSubscription, Assignment } = env;

const ns = new k8s.core.v1.Namespace(
  "common-keda",
  {
    metadata: {
      name: "common-keda",
    },
  },
  { provider: k8sProvider }
);


export const keda = new k8s.helm.v3.Chart(
  "keda",
  {
    chart: "keda",
    version: "2.3.2",
    namespace: ns.id,
    fetchOpts: {
      repo:
        "https://kedacore.github.io/charts",
    },
  },
  { provider: k8sProvider }
);
