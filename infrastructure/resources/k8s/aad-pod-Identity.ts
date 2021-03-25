import * as pulumi from "@pulumi/pulumi";
import * as k8s from "@pulumi/kubernetes";
import { clientId, k8sProvider, cluster } from "../cluster";
import env from "../../environment";
const { currentSubscription, resourceGroup, Assignment } = env;

const nodesResourceGroupId = pulumi
  .all([currentSubscription, cluster.nodeResourceGroup])
  .apply(
    ([subscription, nodeResourceGroup]) =>
      `/subscriptions/${subscription.subscriptionId}/resourceGroups/${nodeResourceGroup}`
  );

const assignments = [
  new Assignment("role-rg-MiO", {
    principalId: clientId,
    scope: resourceGroup.id,
    roleDefinitionName: "Managed Identity Operator",
  }),
  new Assignment("role-rg-VmC", {
    principalId: clientId,
    scope: resourceGroup.id,
    roleDefinitionName: "Virtual Machine Contributor",
  }),
  new Assignment("role-node-rg-MiO", {
    principalId: clientId,
    scope: nodesResourceGroupId,
    roleDefinitionName: "Managed Identity Operator",
  }),
  new Assignment("role-node-rg-VmC", {
    principalId: clientId,
    scope: nodesResourceGroupId,
    roleDefinitionName: "Virtual Machine Contributor",
  }),
];

const ns = new k8s.core.v1.Namespace(
  "common-managed-identity",
  {
    metadata: {
      name: "common-managed-identity",
    },
  },
  { provider: k8sProvider }
);

export const aadPodIdentity = new k8s.helm.v3.Chart(
  "aad-pod-identity",
  {
    chart: "aad-pod-identity",
    version: "3.0.3",
    namespace: ns.id,
    fetchOpts: {
      repo:
        "https://raw.githubusercontent.com/Azure/aad-pod-identity/master/charts",
    },
  },
  { provider: k8sProvider, dependsOn: assignments }
);
