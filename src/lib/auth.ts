
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // Use true for port 465, false for port 587
    auth: {
        user: process.env.APP_USER,
        pass: process.env.APP_PASS
    }
});

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    trustedOrigins: [process.env.APP_URL!],
    emailAndPassword: {
        enabled: true,
        autoSignIn: false,
        requireEmailVerification: false
    },
    user: {
        additionalFields: {
            role: {
                type: "string",
                default: "CUSTOMER",
                required: false
            },
            status: {
                type: "string",
                default: "ACTIVE",
                required: false
            },
            phone: {
                type: "string",
                required: false
            }

        }
    },
    emailVerification: {
        sendOnSignUp: true,
        autoSignInAfterVerification: true,
        sendVerificationEmail: async ({ user, url, token }, request) => {
            try {
                const verificationUrl = `${process.env.APP_URL}/verify-email?token=${token}`
                const info = await transporter.sendMail({
                    from: '"MediCorner" <medicroner@gmail.com>',
                    to: user.email,
                    subject: "Please verify email",
                    html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Email Verification | MediCorner</title>
</head>

<body style="margin:0; padding:0; background-color:#f4f6f8; font-family: Arial, Helvetica, sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="padding:24px;">
    <tr>
      <td align="center">

        <table width="600" cellpadding="0" cellspacing="0"
          style="background:#ffffff; border-radius:10px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.06);">

          <!-- Header -->
          <tr>
            <td style="background:#0ea5e9; padding:24px; text-align:center;">
              <h1 style="margin:0; color:#ffffff; font-size:26px;">
                💊 MediCorner
              </h1>
              <p style="margin:6px 0 0; color:#e0f2fe; font-size:14px;">
                Your Trusted Online Medicine Corner
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px; color:#1f2937;">
              <h2 style="margin-top:0; font-size:22px;">
                Verify your email address
              </h2>

              <p style="font-size:15px; line-height:1.7;">
                Hi <b>${user.name ?? "there"}</b>,<br /><br />
                Welcome to <b>MediCorner</b> 👋  
                Please confirm your email address to activate your account and get full access to our platform.
              </p>

              <!-- Button -->
              <div style="text-align:center; margin:32px 0;">
                <a href="${verificationUrl}"
                  style="background:#0ea5e9; color:#ffffff; text-decoration:none; padding:14px 34px;
                         font-size:16px; border-radius:8px; display:inline-block;">
                  Verify Email
                </a>
              </div>

              <p style="font-size:14px; color:#4b5563; line-height:1.6;">
                If the button doesn’t work, copy and paste the link below into your browser:
              </p>

              <p style="word-break:break-all; font-size:13px; color:#0ea5e9;">
                ${verificationUrl}
              </p>

              <p style="font-size:14px; color:#6b7280; margin-top:28px;">
                If you didn’t create a MediCorner account, you can safely ignore this email.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb; padding:16px; text-align:center;">
              <p style="margin:0; font-size:12px; color:#9ca3af;">
                © ${new Date().getFullYear()} MediCorner. All rights reserved.
              </p>
              <p style="margin:4px 0 0; font-size:12px; color:#9ca3af;">
                OTC medicines only · Safe · Reliable · Trusted
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>
`
                })

                console.log("Message sent:", info.messageId)
            } catch (error: any) {
                console.log({ error: error });
                throw error;
            }
        },
    },
    socialProviders: {
        google: {
            prompt: "select_account consent",
            accessType: "offline",
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        },
    },
});
