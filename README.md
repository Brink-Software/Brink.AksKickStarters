# AksKickStarters
A pulumi project to spin up an azure kubernetes service with the following properties out of the box:
- [Application gateway ingress controller](https://docs.microsoft.com/en-us/azure/application-gateway/ingress-controller-overview)
- [AAD pod identity](https://github.com/Azure/aad-pod-identity)
- [Azure Monitor for containers](https://docs.microsoft.com/en-us/azure/azure-monitor/insights/container-insights-overview)
- [Diagnostic logs for Application gateway](https://docs.microsoft.com/en-us/azure/application-gateway/application-gateway-diagnostics)
- [Ephemeral nodes](https://docs.microsoft.com/en-us/azure/aks/cluster-configuration#ephemeral-os), [Auto scaling](https://docs.microsoft.com/en-us/azure/aks/cluster-autoscaler), and [Azure CNI](https://docs.microsoft.com/en-us/azure/aks/configure-azure-cni)

## Pre-Requisites
- [pulumi cli](https://www.pulumi.com/docs/get-started/azure/begin/)
- [azure cli](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli)
- [kubectl](https://kubernetes.io/docs/tasks/tools/install-kubectl/)
- [helm](https://helm.sh/docs/intro/install/)



## Getting started
Ensure that the azure cli is logged in and that you have selected the subcription you wat to use
```
az login
az account set -s <your-subcription>
```

Ensure you have logged in to pulumi

```
pulumi login
```
Clone the project and start deployment

```
git clone https://github.com/Ibis-Software/AksKickStarters.git

cd AksKickStarters/infrastructure

npm install

pulumi stack init dev

pulumi up 
```
Confirm update, and after a while the deployment should be done and you should see an output simular to this `publicIPAddress: "40.74.34.86"`.
If you visit that address you should see the default nginx welcome page.

## Optional steps 
After adding the optional items you want you should run `pulumi up` to update your deployment. 

### Add SSL certificates from Keyvault
You can link you ssl certificates from keyvault by adding them to the pulumi configuration. 
```
pulumi config set --path pulumi config set --path keyVaultResourceId /subscriptions/<subscriptionId>/resourceGroups/<resourceGroup>/providers/Microsoft.KeyVault/vaults/<keyvault-name>

pulumi config set --path "sslCertificates[0].name" <ssl-certificate-name>

pulumi config set --path "sslCertificates[0].secret" https://<keyvault-name>.vault.azure.net/secrets/<certificate-name> --secret
```

You should then be able to create an ingress to use the certificate as follows
```
apiVersion: extensions/v1beta1
kind: Ingress
metadata:
  name: aspnetapp
  annotations:
    kubernetes.io/ingress.class: azure/application-gateway
    appgw.ingress.kubernetes.io/appgw-ssl-certificate: <ssl-certificate-name>
    appgw.ingress.kubernetes.io/ssl-redirect: "true"
spec:
  rules:
  ...
```

### Link Azure Container Registry
You can allow aks to use your own container registry to do this run the following command:
```
pulumi config set --path acrResourceId /subscriptions/<subscriptionId>/resourceGroups/<resourceGroup>/providers/Microsoft.ContainerRegistry/registries/<registry-name>
```


### Add windows node pool
You can add a windows node pool by running the following command:

```
pulumi config set --path windows.enabled true
```


## Configuration



## Issues

- Runnning `pulumi destroy` will give you the following error  `error: 'azureassignedidentities.aadpodidentity.k8s.io' timed out waiting to be Ready`. The only way to get arround this is to export the stack and remove the offending item and then import the stack again. See [pulumi stack](https://www.pulumi.com/docs/reference/cli/pulumi_stack/) for more info.





