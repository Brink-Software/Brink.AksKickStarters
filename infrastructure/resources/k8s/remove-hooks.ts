import * as k8s from "@pulumi/kubernetes";
import * as pulumi from "@pulumi/pulumi";

export const removeHelmHooksTransformation = (obj: any) => {
  if (obj.metadata.annotations?.["helm.sh/hook"]) {
    const {
      "helm.sh/hook": junk,
      "helm.sh/hook-delete-policy": junk2,
      ...validAnnotations
    } = obj.metadata.annotations;
    obj.metadata.annotations = validAnnotations;
  }
};
