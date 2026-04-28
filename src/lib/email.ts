import axios from "axios";

interface TestmailEmailParams {
  to: string;
  subject: string;
  html: string;
}

export const sendTestmailNotification = async (
  params: TestmailEmailParams
): Promise<boolean> => {
  try {
    const namespace = process.env.TESTMAIL_NAMESPACE;
    const apiKey = process.env.TESTMAIL_API_KEY;

    if (!namespace || !apiKey) {
      console.error("Testmail configuration missing");
      return false;
    }

    const response = await axios.post(
      `https://api.testmail.app/api/json?namespace=${namespace}&key=${apiKey}`,
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
  const name = firstName || "User";

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>Welcome to Clerk Auth Microservice</title>
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
            <p>Thank you for signing up with Clerk Auth Microservice.</p>
            <p>Your account has been successfully created. You can now access all the features of our platform.</p>
            <p style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:5173"}/dashboard" class="button">Go to Dashboard</a>
            </p>
            <p>If you have any questions, feel free to contact our support team.</p>
            <div class="footer">
              <p>&copy; 2024 Clerk Auth Microservice. All rights reserved.</p>
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
