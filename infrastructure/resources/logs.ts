import * as azure from "@pulumi/azure-nextgen";
import env from "../environment";

const { config, resourceGroup, resourceName } = env;
const workspaceName = resourceName("log", {
  suffix: config.get("logSuffix"),
});
export const workspace = new azure.operationalinsights.v20200801.Workspace(
  workspaceName,
  {
    workspaceName,
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
