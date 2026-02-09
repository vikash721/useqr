export { FROM_EMAIL, FROM_LABEL, FROM_HEADER } from "./constants";
export { getResendClient, sendEmail } from "./resend";
export type { SendEmailParams } from "./resend";
export { sendWelcomeEmail } from "./send";
export {
  getWelcomeEmailSubject,
  getWelcomeEmailHtml,
} from "./templates/welcome";
