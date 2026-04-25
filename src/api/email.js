import axios from "axios";
import { getApiBaseUrl, buildApiHeaders } from "../utils/apiBase";

export async function send(subject, message, attachments) {
  return await axios.post(
    `${getApiBaseUrl()}/email/send`,
    {
      subject,
      message,
      attachments,
    },
    { headers: buildApiHeaders("POST", true) },
  );
}
