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



## TLDR ;)
```
git clone https://github.com/Ibis-Software/AksKickStarters.git

cd AksKickStarters/infrastructure

pulumi up 
```

