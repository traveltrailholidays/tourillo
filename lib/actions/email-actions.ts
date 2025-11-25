'use server';

import nodemailer from 'nodemailer';

// Create reusable transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verify transporter configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('SMTP connection error:', error);
  } else {
    console.log('SMTP server is ready to send emails');
  }
});

// DYNAMIC: Accept any object with string values
interface DynamicEmailData {
  [key: string]: string | number | boolean | undefined | null;
}

interface EmailOptions {
  formType: 'contact' | 'quote' | 'booking' | 'custom';
  data: DynamicEmailData;
  customSubject?: string;
}

// Field display names for better formatting
const fieldLabels: { [key: string]: string } = {
  name: 'Name',
  email: 'Email',
  phone: 'Phone Number',
  subject: 'Subject',
  message: 'Message',
  destination: 'Destination',
  date: 'Travel Date',
  days: 'Number of Days',
  adults: 'Adults',
  children: 'Children',
  budget: 'Budget',
  specialRequests: 'Special Requests',
};

// Get display label for field
function getFieldLabel(key: string): string {
  return fieldLabels[key] || key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
}

// Generate HTML table rows from data
function generateEmailFields(data: DynamicEmailData): string {
  return Object.entries(data)
    .filter(([_, value]) => value !== null && value !== undefined && value !== '')
    .map(([key, value]) => {
      const label = getFieldLabel(key);
      const formattedValue =
        key === 'email'
          ? `<a href="mailto:${value}" style="color: #667eea; text-decoration: none;">${value}</a>`
          : key === 'phone'
            ? `<a href="tel:${value}" style="color: #667eea; text-decoration: none;">${value}</a>`
            : key === 'message' || key === 'specialRequests'
              ? `<div style="background-color: #f9fafb; padding: 15px; border-radius: 6px; border-left: 4px solid #667eea; margin-top: 10px;">
               <p style="color: #374151; line-height: 1.6; margin: 0; white-space: pre-wrap;">${value}</p>
             </div>`
              : value;

      // For message-like fields, show them separately
      if (key === 'message' || key === 'specialRequests') {
        return `
          <tr>
            <td colspan="2" style="padding: 20px 0;">
              <h3 style="color: #667eea; margin-bottom: 10px; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">
                ${label}
              </h3>
              ${formattedValue}
            </td>
          </tr>
        `;
      }

      return `
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
            <strong style="color: #374151;">${label}:</strong>
          </td>
          <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280;">
            ${formattedValue}
          </td>
        </tr>
      `;
    })
    .join('');
}

// Generate plain text version
function generatePlainText(data: DynamicEmailData): string {
  return Object.entries(data)
    .filter(([_, value]) => value !== null && value !== undefined && value !== '')
    .map(([key, value]) => {
      const label = getFieldLabel(key);
      return `${label}: ${value}`;
    })
    .join('\n');
}

// Get form type title
function getFormTitle(formType: string): string {
  const titles: { [key: string]: string } = {
    contact: 'Contact Form',
    quote: 'Quote Request',
    booking: 'Booking Request',
    custom: 'Form Submission',
  };
  return titles[formType] || 'Form Submission';
}

// Main dynamic email function
export async function sendDynamicEmail({ formType, data, customSubject }: EmailOptions) {
  try {
    // Validate that we have at least some data
    if (!data || Object.keys(data).length === 0) {
      return {
        success: false,
        error: 'No data provided',
      };
    }

    const formTitle = getFormTitle(formType);
    const userName = data.name || 'Unknown User';
    const userEmail = data.email as string;

    // Generate subject
    const emailSubject =
      customSubject ||
      (data.subject ? `${data.subject} - ${formTitle} from ${userName}` : `New ${formTitle} from ${userName}`);

    // Email options - ALWAYS send to mytourillo@gmail.com
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: 'mytourillo@gmail.com',
      replyTo: userEmail || process.env.EMAIL_FROM,
      subject: emailSubject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb; border-radius: 8px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">New ${formTitle}</h1>
          </div>
          
          <div style="background-color: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <div style="margin-bottom: 20px;">
              <h3 style="color: #667eea; margin-bottom: 10px; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">
                Submission Details
              </h3>
              <table style="width: 100%; border-collapse: collapse;">
                ${generateEmailFields(data)}
              </table>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #9ca3af; font-size: 12px;">
              <p style="margin: 0;">This email was sent from the Tourillo ${formTitle.toLowerCase()}</p>
              <p style="margin: 5px 0 0 0;">Received: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
            </div>
          </div>
        </div>
      `,
      text: `
New ${formTitle}

${generatePlainText(data)}

---
Received: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
      `,
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);

    console.log(`${formTitle} email sent successfully:`, info.messageId);

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error('Failed to send email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send email',
    };
  }
}

// Legacy function for backward compatibility - Contact Form
export async function sendEmail(data: {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}) {
  return sendDynamicEmail({
    formType: 'contact',
    data,
  });
}

// Quote form specific function
export async function sendQuoteEmail(data: {
  destination: string;
  date: string;
  days: number;
  name: string;
  email: string;
  phone: string;
}) {
  return sendDynamicEmail({
    formType: 'quote',
    data,
  });
}
