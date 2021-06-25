import * as azuread from "@pulumi/azuread";
import * as pulumi from "@pulumi/pulumi";

import env from "./environment";

import { publicIP, cluster, acrResource, gateway } from "./resources";

const domain = azuread
  .getDomains()
  .then((d) => d.domains.find((d) => d.isDefault)?.domainName);

export const PublicIPAddress = publicIP.ipAddress;

export const SubcriptionId = env.currentSubscription.then(
  (sub) => sub.subscriptionId
);
export const TenantId = env.currentSubscription.then((sub) => sub.tenantId);
export const SubcriptionName = env.currentSubscription.then(
  (sub) => sub.displayName
);

export const ResourceGroupName = env.resourceGroup.name;
export const GatewayName = gateway.name;
export const ClusterName = cluster.name;
export const AcrName = acrResource?.name;

export const ResourceGroupUrl = pulumi
  .all([domain, SubcriptionId, ResourceGroupName])
  .apply(
    ([domain, subcriptionId, resourceGroupName]) =>
      `https://portal.azure.com/#@${domain}/resource/subscriptions/${subcriptionId}/resourceGroups/${resourceGroupName}/overview`
  );

export const GatewayUrl = pulumi
  .all([domain, SubcriptionId, ResourceGroupName, GatewayName])
  .apply(
    ([domain, subcriptionId, resourceGroupName, gatewayName]) =>
      `https://portal.azure.com/#@${domain}/resource/subscriptions/${subcriptionId}/resourceGroups/${resourceGroupName}/providers/Microsoft.Network/applicationGateways/${gatewayName}/overview`
  );
