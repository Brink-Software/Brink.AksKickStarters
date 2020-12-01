import * as azure from "@pulumi/azure-nextgen";
import { RandomUuid } from "@pulumi/random";
import env from "../environment";

const { config, resourceGroup, resourceName } = env;
const workspaceName = resourceName("log");
const uuid = new RandomUuid("log-uuid");


export const workspace = new azure.operationalinsights.v20200801.Workspace(
  workspaceName,
  {
    workspaceName : uuid.result.apply(u => workspaceName + u),
    resourceGroupName: resourceGroup.name,
    location: resourceGroup.location,
    sku: {
      name: "pergb2018",
    },
    workspaceCapping: {
      dailyQuotaGb: -1,
    },
    retentionInDays: 30,
    publicNetworkAccessForIngestion: "Enabled",
    publicNetworkAccessForQuery: "Enabled",
  }
);
