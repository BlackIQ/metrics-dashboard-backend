# utils/mail_templates.py


def base_email_template(title: str, content_html: str) -> str:
    """Base HTML wrapper matching MUI Dark Theme."""
    return f"""
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>{title}</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #0B0F17; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #F3F4F6; -webkit-font-smoothing: antialiased;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #0B0F17; padding: 40px 20px;">
          <tr>
            <td align="center">
              <!-- Main Card -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 500px; background-color: #111827; border: 1px solid #1E293B; border-radius: 8px; overflow: hidden; padding: 32px 24px;">
                <!-- Header / Logo -->
                <tr>
                  <td style="padding-bottom: 24px; border-bottom: 1px solid #1E293B; text-align: left;">
                    <span style="font-size: 20px; font-weight: 700; color: #FFFFFF; letter-spacing: -0.5px;">OpenHubble</span>
                  </td>
                </tr>
                <!-- Body Content -->
                <tr>
                  <td style="padding-top: 24px; font-size: 14px; line-height: 1.6; color: #F3F4F6;">
                    {content_html}
                  </td>
                </tr>
                <!-- Footer -->
                <tr>
                  <td style="padding-top: 32px; border-top: 1px solid #1E293B; margin-top: 32px; text-align: center; font-size: 12px; color: #9CA3AF;">
                    &copy; OpenHubble. All rights reserved.<br/>
                    If you didn't request this email, you can safely ignore it.
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
    """


def get_button_html(url: str, text: str) -> str:
    """Reusable MUI-styled primary button."""
    return f"""
    <div style="margin: 28px 0; text-align: center;">
      <a href="{url}" target="_blank" style="background-color: #3B82F6; color: #FFFFFF; text-decoration: none; padding: 12px 24px; border-radius: 4px; font-weight: 500; font-size: 14px; display: inline-block;">
        {text}
      </a>
    </div>
    """


def get_signup_email(confirmation_url: str) -> str:
    content = f"""
    <h2 style="margin: 0 0 16px 0; font-size: 20px; color: #FFFFFF; font-weight: 600;">Confirm your email address</h2>
    <p style="margin: 0 0 16px 0; color: #9CA3AF;">Welcome to OpenHubble! Please confirm your account by clicking the button below.</p>
    {get_button_html(confirmation_url, "Confirm Account")}
    <p style="margin: 0; font-size: 12px; color: #9CA3AF;">Or copy and paste this URL into your browser:<br/><a href="{confirmation_url}" style="color: #3B82F6;">{confirmation_url}</a></p>
    """
    return base_email_template("Confirm Your Account", content)


def get_signin_notification_email() -> str:
    content = """
    <h2 style="margin: 0 0 16px 0; font-size: 20px; color: #FFFFFF; font-weight: 600;">New Sign-In Detected</h2>
    <p style="margin: 0 0 16px 0; color: #9CA3AF;">We noticed a new sign-in to your OpenHubble account. If this was you, no action is required.</p>
    <p style="margin: 0; font-size: 13px; color: #EF4444; background-color: #1E1B2E; padding: 12px; border-radius: 4px; border-left: 3px solid #EF4444;">
      If you did not initiate this login, please reset your password immediately to secure your account.
    </p>
    """
    return base_email_template("New Login Alert", content)


def get_welcome_email() -> str:
    content = """
    <h2 style="margin: 0 0 16px 0; font-size: 20px; color: #FFFFFF; font-weight: 600;">Welcome to OpenHubble! 🎉</h2>
    <p style="margin: 0 0 16px 0; color: #F3F4F6;">Your email has been successfully verified, and your account is now fully active.</p>
    <p style="margin: 0; color: #9CA3AF;">You can now access all features and start exploring the platform.</p>
    """
    return base_email_template("Welcome to OpenHubble", content)


def get_forgot_password_email(reset_url: str) -> str:
    content = f"""
    <h2 style="margin: 0 0 16px 0; font-size: 20px; color: #FFFFFF; font-weight: 600;">Reset your password</h2>
    <p style="margin: 0 0 16px 0; color: #9CA3AF;">We received a request to reset your OpenHubble account password. Click below to choose a new password.</p>
    {get_button_html(reset_url, "Reset Password")}
    <p style="margin: 0; font-size: 12px; color: #9CA3AF;">This link is time-sensitive. If you did not request a reset, you can ignore this email.</p>
    """
    return base_email_template("Reset Password", content)


def get_password_changed_email() -> str:
    content = """
    <h2 style="margin: 0 0 16px 0; font-size: 20px; color: #FFFFFF; font-weight: 600;">Password Changed</h2>
    <p style="margin: 0 0 16px 0; color: #F3F4F6;">Your password for OpenHubble was successfully updated.</p>
    <p style="margin: 0; font-size: 13px; color: #EF4444; background-color: #1E1B2E; padding: 12px; border-radius: 4px; border-left: 3px solid #EF4444;">
      If you did not perform this change, please contact support immediately.
    </p>
    """
    return base_email_template("Password Changed", content)
