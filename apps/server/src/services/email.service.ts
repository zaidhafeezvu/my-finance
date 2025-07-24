import { appConfig } from '@finance-app/config'

// Email service interface
interface EmailService {
  sendEmailVerification(email: string, token: string, firstName: string): Promise<void>
  sendPasswordReset(email: string, token: string, firstName: string): Promise<void>
  sendWelcomeEmail(email: string, firstName: string): Promise<void>
}

class MockEmailService implements EmailService {
  async sendEmailVerification(email: string, token: string, firstName: string): Promise<void> {
    console.log(`📧 [MOCK] Email verification sent to ${email}`)
    console.log(`🔗 Verification link: ${appConfig.corsOrigin}/verify-email?token=${token}`)
    console.log(`👋 Hello ${firstName}!`)
  }

  async sendPasswordReset(email: string, token: string, firstName: string): Promise<void> {
    console.log(`📧 [MOCK] Password reset sent to ${email}`)
    console.log(`🔗 Reset link: ${appConfig.corsOrigin}/reset-password?token=${token}`)
    console.log(`👋 Hello ${firstName}!`)
  }

  async sendWelcomeEmail(email: string, firstName: string): Promise<void> {
    console.log(`📧 [MOCK] Welcome email sent to ${email}`)
    console.log(`👋 Welcome ${firstName}!`)
  }
}

// Real email service implementation (placeholder for future implementation)
class RealEmailService implements EmailService {
  async sendEmailVerification(email: string, token: string, firstName: string): Promise<void> {
    // TODO: Implement with actual email service (SendGrid, AWS SES, etc.)
    const verificationUrl = `${appConfig.corsOrigin}/verify-email?token=${token}`
    
    const emailContent = {
      to: email,
      subject: 'Verify your Finance App account',
      html: `
        <h2>Welcome to Finance App, ${firstName}!</h2>
        <p>Please click the link below to verify your email address:</p>
        <a href="${verificationUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email</a>
        <p>If you didn't create an account, please ignore this email.</p>
        <p>This link will expire in 24 hours.</p>
      `
    }
    
    console.log('📧 Would send email:', emailContent)
    // Actual implementation would send the email here
  }

  async sendPasswordReset(email: string, token: string, firstName: string): Promise<void> {
    const resetUrl = `${appConfig.corsOrigin}/reset-password?token=${token}`
    
    const emailContent = {
      to: email,
      subject: 'Reset your Finance App password',
      html: `
        <h2>Password Reset Request</h2>
        <p>Hello ${firstName},</p>
        <p>You requested to reset your password. Click the link below to set a new password:</p>
        <a href="${resetUrl}" style="background-color: #dc3545; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
        <p>If you didn't request this, please ignore this email.</p>
        <p>This link will expire in 1 hour.</p>
      `
    }
    
    console.log('📧 Would send email:', emailContent)
    // Actual implementation would send the email here
  }

  async sendWelcomeEmail(email: string, firstName: string): Promise<void> {
    const emailContent = {
      to: email,
      subject: 'Welcome to Finance App!',
      html: `
        <h2>Welcome to Finance App, ${firstName}!</h2>
        <p>Your account has been successfully verified. You can now start managing your finances!</p>
        <p>Get started by:</p>
        <ul>
          <li>Connecting your bank accounts</li>
          <li>Setting up your first budget</li>
          <li>Exploring your financial dashboard</li>
        </ul>
        <p>If you have any questions, feel free to contact our support team.</p>
      `
    }
    
    console.log('📧 Would send email:', emailContent)
    // Actual implementation would send the email here
  }
}

// Export the appropriate service based on environment
export const emailService: EmailService = appConfig.nodeEnv === 'development' 
  ? new MockEmailService() 
  : new RealEmailService()