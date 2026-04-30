import axios from "axios";
import { getConfig } from "./config";

interface TestmailEmailParams {
  to: string;
  subject: string;
  html: string;
}

export const sendTestmailNotification = async (
  params: TestmailEmailParams
): Promise<boolean> => {
  try {
    const config = getConfig();
    const { namespace, apiKey, apiUrl, enabled } = config.testmail;

    if (!enabled) {
      console.warn("Testmail is disabled in configuration");
      return false;
    }

    if (!namespace || !apiKey) {
      console.error("Testmail configuration missing: namespace or apiKey");
      return false;
    }

    const response = await axios.post(
      `${apiUrl}?namespace=${namespace}&key=${apiKey}`,
      {
        to: params.to,
        subject: params.subject,
        html: params.html,
      }
    );

    console.log("Email sent successfully:", response.data);
    return response.status === 200;
  } catch (error) {
    console.error("Error sending email via Testmail:", error);
    return false;
  }
};

export const sendSignupWelcomeEmail = async (
  email: string,
  firstName?: string
): Promise<boolean> => {
  const config = getConfig();
  const name = firstName || "User";
  const appUrl = config.app.url;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>Welcome to ${config.app.name}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4; }
          .content { background-color: #fff; padding: 20px; border-radius: 5px; }
          .header { color: #6c5ce7; text-align: center; margin-bottom: 20px; }
          .footer { margin-top: 20px; text-align: center; font-size: 12px; color: #666; }
          .button { display: inline-block; padding: 10px 20px; background-color: #6c5ce7; color: #fff; text-decoration: none; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="content">
            <div class="header">
              <h1>Welcome, ${name}!</h1>
            </div>
            <p>Thank you for signing up with ${config.app.name}.</p>
            <p>Your account has been successfully created. You can now access all the features of our platform.</p>
            <p style="text-align: center; margin: 30px 0;">
              <a href="${appUrl}/dashboard" class="button">Go to Dashboard</a>
            </p>
            <p>If you have any questions, feel free to contact our support team.</p>
            <div class="footer">
              <p>&copy; 2024 ${config.app.name}. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendTestmailNotification({
    to: email,
    subject: `Welcome ${name}! Your Account is Ready`,
    html,
  });
};
