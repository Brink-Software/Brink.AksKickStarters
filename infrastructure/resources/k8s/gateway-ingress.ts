import * as pulumi from "@pulumi/pulumi";
import * as azure from "@pulumi/azure-nextgen";
import * as k8s from "@pulumi/kubernetes";
import { aadPodIdentity } from "./aad-pod-Identity";
import { k8sProvider } from "../cluster";
import { gateway } from "../gateway";
import env from "../../environment";

const { resourceGroup, currentSubscription, Assignment } = env;
const idName = `id-ingress-${env.name}`;
export const ingressId = new azure.managedidentity.latest.UserAssignedIdentity(
  idName,
  {
    resourceName: idName,
    resourceGroupName: resourceGroup.name,
    location: resourceGroup.location,
  }
);
const ns = new k8s.core.v1.Namespace(
  "common-azure-ingress",
  {
    metadata: {
      name: "common-azure-ingress",
    },
  },
  { provider: k8sProvider }
);
const assignment = new Assignment("role-ingres-contrib", {
  principalId: ingressId.principalId,
  scope: resourceGroup.id,
  roleDefinitionName: "Contributor",
});

const values = pulumi
  .all([ingressId.id, ingressId.clientId, gateway.name, resourceGroup.name, currentSubscription])
  .apply(([identityResourceID, identityClientID, name, resourceGroup, subscription]) => {
    return {
      appgw: {
        subscriptionId : subscription.subscriptionId,
        resourceGroup,
        name,
        shared: false,
        usePrivateIP: false,
      },
      armAuth: {
        type: "aadPodIdentity",
        identityResourceID,
        identityClientID,
      },
      rbac: {
        enabled: true,
      },
    };
  });

export const agic = new k8s.helm.v3.Chart(
  "ingress-azure",
  {
    chart: "ingress-azure",
    version: "1.4.0",
    namespace: ns.id,
    values,
    fetchOpts: {
      repo:
        "https://appgwingress.blob.core.windows.net/ingress-azure-helm-package",
    },
  },
  { provider: k8sProvider, dependsOn: [aadPodIdentity, assignment, gateway] }
);
