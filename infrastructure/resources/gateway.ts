import * as pulumi from "@pulumi/pulumi";
import * as azure from "@pulumi/azure-nextgen";
import { AccessPolicy } from "@pulumi/azure/keyvault";
import { gatewaySubnet } from "./vnet";
import { workspace } from "./logs";
import env from "../environment";

const { config, resourceGroup, currentSubscription, resourceName } = env;
const applicationGatewayName = resourceName("agw");
const defaultName = "default";
const keyVaultResourceId = config.get("keyVaultResourceId");
const applicationGatewayTier =
  config.get("applicationGatewayTier") ?? "Standard_v2";
const resourceId = (resource: string) =>
  pulumi
    .all([resourceGroup.name, currentSubscription])
    .apply(
      ([resourceGroupName, subscription]) =>
        `/subscriptions/${subscription.subscriptionId}/resourceGroups/${resourceGroupName}/providers/Microsoft.Network/applicationGateways/${applicationGatewayName}/${resource}/${defaultName}`
    );
const idName = `id-${applicationGatewayName}`;
const gatewayId = new azure.managedidentity.latest.UserAssignedIdentity(
  idName,
  {
    resourceName: idName,
    resourceGroupName: resourceGroup.name,
    location: resourceGroup.location,
  }
);
let dependsOn: pulumi.Resource[] = [];
if (keyVaultResourceId) {
  var keyvault = azure.keyvault.latest.Vault.get(
    "keyvault",
    keyVaultResourceId
  );
  dependsOn.push(
    new AccessPolicy("keyvaultaccess", {
      secretPermissions: ["get"],
      objectId: gatewayId.principalId,
      tenantId: gatewayId.tenantId,
      keyVaultId: keyvault.id,
    })
  );
}
export const sslCertificates =
  config.getSecretObject<SslCertificate[]>("sslCertificates") ||
  pulumi.Output.create([]);
const pipName = resourceName("pip");

export const publicIP = new azure.network.latest.PublicIPAddress(pipName, {
  resourceGroupName: resourceGroup.name,
  publicIpAddressName: pipName,
  location: resourceGroup.location,
  sku: {
    name: "Standard",
  },
  publicIPAllocationMethod: "Static",
});

export const gateway = new azure.network.latest.ApplicationGateway(
  applicationGatewayName,
  {
    applicationGatewayName,
    resourceGroupName: resourceGroup.name,
    location: resourceGroup.location,
    sku: {
      name: applicationGatewayTier,
      tier: applicationGatewayTier,
    },
    identity: {
      type: "UserAssigned",
      userAssignedIdentities: gatewayId.id.apply((id) => {
        const dict: { [key: string]: object } = {};
        dict[id] = {};
        return dict;
      }),
    },
    sslCertificates: sslCertificates.apply((certificates) =>
      certificates.map((cert) => ({
        name: cert.name,
        keyVaultSecretId: cert.secret,
      }))
    ),
    autoscaleConfiguration: {
      minCapacity: 0,
      maxCapacity: 2,
    },
    gatewayIPConfigurations: [
      {
        name: defaultName,
        subnet: {
          id: gatewaySubnet.id,
        },
      },
    ],
    frontendPorts: [
      {
        name: defaultName,
        port: 80,
      },
    ],
    frontendIPConfigurations: [
      {
        name: defaultName,
        publicIPAddress: {
          id: publicIP.id,
        },
      },
    ],
    backendAddressPools: [
      {
        name: defaultName,
      },
    ],
    backendHttpSettingsCollection: [
      {
        name: defaultName,
        cookieBasedAffinity: "Disabled",
        port: 80,
        protocol: "Http",
        requestTimeout: 60,
      },
    ],
    httpListeners: [
      {
        name: defaultName,
        frontendIPConfiguration: {
          id: resourceId("frontendIPConfigurations"),
        },
        frontendPort: {
          id: resourceId("frontendPorts"),
        },
        protocol: "Http",
      },
    ],
    requestRoutingRules: [
      {
        name: defaultName,
        httpListener: {
          id: resourceId("httpListeners"),
        },
        backendAddressPool: {
          id: resourceId("backendAddressPools"),
        },
        backendHttpSettings: {
          id: resourceId("backendHttpSettingsCollection"),
        },
      },
    ],
    sslPolicy: {
      policyType: "Predefined",
      policyName: "AppGwSslPolicy20170401S",
    },
  },
  {
    dependsOn,
  }
);
const _ = new azure.insights.v20170501preview.DiagnosticSetting(
  "agwDiagnostics",
  {
    name: "agwDiagnostics",
    resourceUri: gateway.id,
    workspaceId: workspace.id,
    logs: [
      {
        category: "ApplicationGatewayAccessLog",
        enabled: true,
        retentionPolicy: {
          days: 0,
          enabled: false,
        },
      },
      {
        category: "ApplicationGatewayPerformanceLog",
        enabled: true,
        retentionPolicy: {
          days: 0,
          enabled: false,
        },
      },
      {
        category: "ApplicationGatewayFirewallLog",
        enabled: applicationGatewayTier === "WAF_v2",
        retentionPolicy: {
          days: 0,
          enabled: false,
        },
      },
    ],
    metrics: [
      {
        category: "AllMetrics",
        enabled: true,
        retentionPolicy: {
          days: 0,
          enabled: false,
        },
      },
    ],
  }
);

interface SslCertificate {
  name: string;
  secret: string;
}
