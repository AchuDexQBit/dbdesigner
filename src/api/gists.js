import axios from "axios";
import { getApiBaseUrl, buildApiHeaders } from "../utils/apiBase";

export const SHARE_FILENAME = "share.json";
export const VERSION_FILENAME = "versionned.json";

const description = "DB Designer";

const ax = (method, hasBody, extra = {}) => ({
  ...extra,
  headers: { ...buildApiHeaders(method, hasBody), ...(extra.headers || {}) },
});

export async function create(filename, content) {
  const res = await axios.post(
    `${getApiBaseUrl()}/gists`,
    {
      public: false,
      filename,
      description,
      content,
    },
    ax("POST", true),
  );

  return res.data.data.id;
}

export async function patch(gistId, filename, content) {
  const { data } = await axios.patch(
    `${getApiBaseUrl()}/gists/${gistId}`,
    {
      filename,
      content,
    },
    ax("PATCH", true),
  );

  return data.deleted;
}

export async function del(gistId) {
  await axios.delete(`${getApiBaseUrl()}/gists/${gistId}`, ax("DELETE", false));
}

export async function get(gistId) {
  const res = await axios.get(`${getApiBaseUrl()}/gists/${gistId}`, ax("GET", false));

  return res.data;
}

export async function getCommits(gistId, perPage = 20, page = 1) {
  const res = await axios.get(
    `${getApiBaseUrl()}/gists/${gistId}/commits`,
    ax("GET", false, {
      params: {
        per_page: perPage,
        page,
      },
    }),
  );

  return res.data;
}

export async function getVersion(gistId, sha) {
  const res = await axios.get(
    `${getApiBaseUrl()}/gists/${gistId}/${sha}`,
    ax("GET", false),
  );

  return res.data;
}

export async function getCommitsWithFile(
  gistId,
  file,
  limit = 10,
  cursor = null,
) {
  const res = await axios.get(
    `${getApiBaseUrl()}/gists/${gistId}/file-versions/${file}`,
    ax("GET", false, {
      params: {
        limit,
        cursor,
      },
    }),
  );

  return res.data;
}

export async function compare(gistId, file, versionA, versionB) {
  const res = await axios.get(
    `${getApiBaseUrl()}/gists/${gistId}/file/${file}/compare/${versionA}/${versionB}`,
    ax("GET", false),
  );

  return res.data;
}
