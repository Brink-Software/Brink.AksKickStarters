import * as azure from "@pulumi/azure-nextgen";
import env from "../environment";
const { resourceGroup, resourceName } = env;

const virtualNetworkName = resourceName("vnet");

const virtualNetwork = new azure.network.latest.VirtualNetwork(
  virtualNetworkName,
  {
    virtualNetworkName,
    addressSpace: {
      addressPrefixes: ["10.0.0.0/8"],
    },
    location: env.resourceGroup.location,
    resourceGroupName: resourceGroup.name,
  }
);

export const clusterSubnet = new azure.network.latest.Subnet("cluster-subnet", {
  addressPrefix: "10.240.0.0/16",
  resourceGroupName: resourceGroup.name,
  subnetName: "cluster-subnet",
  virtualNetworkName: virtualNetwork.name,
});

export const gatewaySubnet = new azure.network.latest.Subnet("gateway-subnet", {
  addressPrefix: "10.10.0.0/24",
  resourceGroupName: resourceGroup.name,
  subnetName: "gateway-subnet",
  virtualNetworkName: virtualNetwork.name,
});
