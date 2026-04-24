import axios from "axios";
import { getApiBaseUrl } from "../utils/apiBase";

export async function send(subject, message, attachments) {
  return await axios.post(`${getApiBaseUrl()}/email/send`, {
    subject,
    message,
    attachments,
  });
}
