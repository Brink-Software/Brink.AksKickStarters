import * as pulumi from "@pulumi/pulumi";
import * as azure from "@pulumi/azure-native";
import { getSubscription } from "@pulumi/azure/core";
import { Assignment } from "@pulumi/azure/authorization";

// Parse and export configuration variables for this stack.
const config = new pulumi.Config();
const env = pulumi.getStack();
const deploymentName = config.require("name");
const location = config.require("location");

const resourceName = (prefix: string, options: any = {}) => {
  return `${prefix}-${options.name ?? deploymentName}${
    options.suffix ?? ""
  }-${env}`;
};

const currentSubscription = getSubscription({});

const resourceGroupName = resourceName("rg");
const resourceGroup = new azure.resources.ResourceGroup(
  resourceGroupName,
  {
    location,
    resourceGroupName: resourceGroupName,
  }
);

export default {
  config,
  name : env,
  deploymentName,
  currentSubscription,
  resourceGroup,
  resourceName,
  Assignment
}




