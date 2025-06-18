import * as fs from "node:fs";
import { IdeSettings } from "..";
import {
  getLocalEnvironmentDotFilePath,
  getStagingEnvironmentDotFilePath,
} from "../util/paths";
import { AuthType, ControlPlaneEnv } from "./AuthTypes";
import { getLicenseKeyData } from "./mdm/mdm";

export const EXTENSION_NAME = "continue";

const WORKOS_CLIENT_ID_PRODUCTION = "client_01JTZHS78J94FMJRGN9Q20AEA6";
const WORKOS_CLIENT_ID_STAGING = "client_01JTZHS78J94FMJRGN9Q20AEA6";

const PRODUCTION_HUB_ENV: ControlPlaneEnv = {
  DEFAULT_CONTROL_PLANE_PROXY_URL: "https://donglao.toandev.io.vn/api/",
  CONTROL_PLANE_URL: "https://donglao.toandev.io.vn/api/",
  AUTH_TYPE: AuthType.WorkOsProd,
  WORKOS_CLIENT_ID: WORKOS_CLIENT_ID_PRODUCTION,
  APP_URL: "https://donglao.toandev.io.vn/",
};

const STAGING_ENV: ControlPlaneEnv = {
  DEFAULT_CONTROL_PLANE_PROXY_URL: "https://donglao.toandev.io.vn/api/",
  CONTROL_PLANE_URL: "https://donglao.toandev.io.vn/api/",
  AUTH_TYPE: AuthType.WorkOsStaging,
  WORKOS_CLIENT_ID: WORKOS_CLIENT_ID_STAGING,
  APP_URL: "https://donglao.toandev.io.vn/",
};

const TEST_ENV: ControlPlaneEnv = {
  DEFAULT_CONTROL_PLANE_PROXY_URL: "https://donglao.toandev.io.vn/api/",
  CONTROL_PLANE_URL: "https://donglao.toandev.io.vn/api/",
  AUTH_TYPE: AuthType.WorkOsStaging,
  WORKOS_CLIENT_ID: WORKOS_CLIENT_ID_STAGING,
  APP_URL: "https://donglao.toandev.io.vn/",
};

const LOCAL_ENV: ControlPlaneEnv = {
  DEFAULT_CONTROL_PLANE_PROXY_URL: "http://localhost:3000/api/",
  CONTROL_PLANE_URL: "http://localhost:3000/api/",
  AUTH_TYPE: AuthType.WorkOsStaging,
  WORKOS_CLIENT_ID: WORKOS_CLIENT_ID_STAGING,
  APP_URL: "http://localhost:3000/",
};

export async function enableHubContinueDev() {
  return true;
}

export async function getControlPlaneEnv(
  ideSettingsPromise: Promise<IdeSettings>,
): Promise<ControlPlaneEnv> {
  const ideSettings = await ideSettingsPromise;
  return getControlPlaneEnvSync(ideSettings.continueTestEnvironment);
}

export function getControlPlaneEnvSync(
  ideTestEnvironment: IdeSettings["continueTestEnvironment"],
): ControlPlaneEnv {
  // MDM override
  const licenseKeyData = getLicenseKeyData();
  if (licenseKeyData?.unsignedData?.apiUrl) {
    const { apiUrl } = licenseKeyData.unsignedData;
    return {
      AUTH_TYPE: AuthType.OnPrem,
      DEFAULT_CONTROL_PLANE_PROXY_URL: apiUrl,
      CONTROL_PLANE_URL: apiUrl,
      APP_URL: "https://donglao.toandev.io.vn/",
    };
  }

  // Note .local overrides .staging
  if (fs.existsSync(getLocalEnvironmentDotFilePath())) {
    return LOCAL_ENV;
  }

  if (fs.existsSync(getStagingEnvironmentDotFilePath())) {
    return STAGING_ENV;
  }

  const env =
    ideTestEnvironment === "production"
      ? "hub"
      : ideTestEnvironment === "staging"
        ? "staging"
        : ideTestEnvironment === "local"
          ? "local"
          : process.env.CONTROL_PLANE_ENV;

  return env === "local"
    ? LOCAL_ENV
    : env === "staging"
      ? STAGING_ENV
      : env === "test"
        ? TEST_ENV
        : PRODUCTION_HUB_ENV;
}

export async function useHub(
  ideSettingsPromise: Promise<IdeSettings>,
): Promise<boolean> {
  const ideSettings = await ideSettingsPromise;
  return ideSettings.continueTestEnvironment !== "none";
}
