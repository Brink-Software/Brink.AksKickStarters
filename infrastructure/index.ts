import * as k8s from "@pulumi/kubernetes";
import {
  agic,
  sslCertificates,
  k8sProvider,
  windowspool,
  publicIP,
} from "./resources";

const defaultBackend = "default-http-backend";
const appLabels = {
  app: defaultBackend,
};
const options = { provider: k8sProvider, dependsOn: [agic] };

const deployment = new k8s.apps.v1.Deployment(
  defaultBackend,
  {
    metadata: {
      name: defaultBackend,
    },
    spec: {
      selector: {
        matchLabels: appLabels,
      },
      replicas: 2,
      template: {
        metadata: {
          name: defaultBackend,
          labels: appLabels,
        },
        spec: {
          containers: [
            {
              name: defaultBackend,
              image: "nginx",
              ports: [
                {
                  containerPort: 80,
                },
              ],
            },
          ],
        },
      },
    },
  },
  options
);
const service = new k8s.core.v1.Service(
  defaultBackend,
  {
    metadata: {
      name: defaultBackend,
      labels: appLabels,
    },
    spec: {
      type: "ClusterIP",
      selector: appLabels,
      ports: [
        {
          port: 80,
          targetPort: 80,
          protocol: "TCP",
        },
      ],
    },
  },
  options
);
const annotations = sslCertificates.apply((certificates) => {
  const result: any = {
    "kubernetes.io/ingress.class": "azure/application-gateway",
  };
  if (certificates.length > 0) {
    result["appgw.ingress.kubernetes.io/appgw-ssl-certificate"] =
      certificates[0].name;
    result["appgw.ingress.kubernetes.io/ssl-redirect"] = "true";
  }
  return result;
});
const ingress = new k8s.networking.v1beta1.Ingress(
  defaultBackend,
  {
    metadata: {
      name: defaultBackend,
      labels: appLabels,
      annotations,
    },
    spec: {
      rules: [
        {
          http: {
            paths: [
              {
                backend: {
                  serviceName: defaultBackend,
                  servicePort: 80,
                },
              },
            ],
          },
        },
      ],
    },
  },
  options
);
if (!!windowspool) {
  const windowsOptions = { provider: k8sProvider, dependsOn: [agic, windowspool] };
  const windowsDefaultBackend = "windows-default-backend";
  const windowsAppLabels = {
    app: windowsDefaultBackend,
  };
  const deployment = new k8s.apps.v1.Deployment(
    windowsDefaultBackend,
    {
      metadata: {
        name: windowsDefaultBackend,
      },
      spec: {
        selector: {
          matchLabels: windowsAppLabels,
        },
        replicas: 1,
        template: {
          metadata: {
            name: windowsDefaultBackend,
            labels: windowsAppLabels,
          },
          spec: {
            containers: [
              {
                name: windowsDefaultBackend,
                image: "mcr.microsoft.com/dotnet/framework/samples:aspnetapp",
                ports: [
                  {
                    containerPort: 80,
                  },
                ],
              },
            ],
            nodeSelector: {
              "kubernetes.io/os": "windows",
            },
            tolerations: [
              {
                key: "os",
                operator: "Equal",
                value: "windows",
                effect: "NoSchedule",
              },
            ],
          },
        },
      },
    },
    windowsOptions
  );
  const service = new k8s.core.v1.Service(
    windowsDefaultBackend,
    {
      metadata: {
        name: windowsDefaultBackend,
        labels: windowsAppLabels,
      },
      spec: {
        type: "ClusterIP",
        selector: windowsAppLabels,
        ports: [
          {
            port: 80,
            targetPort: 80,
            protocol: "TCP",
          },
        ],
      },
    },
    windowsOptions
  );
  const windowsAnnotations = {
    "kubernetes.io/ingress.class": "azure/application-gateway",
    "appgw.ingress.kubernetes.io/override-frontend-port": "8080",
  };

  const ingress = new k8s.networking.v1beta1.Ingress(
    windowsDefaultBackend,
    {
      metadata: {
        name: windowsDefaultBackend,
        labels: windowsAppLabels,
        annotations: windowsAnnotations,
      },
      spec: {
        rules: [
          {
            http: {
              paths: [
                {
                  backend: {
                    serviceName: windowsDefaultBackend,
                    servicePort: 80,
                  },
                },
              ],
            },
          },
        ],
      },
    },
    windowsOptions
  );
}

export const publicIPAddress = publicIP.ipAddress;
