import { NextResponse } from 'next/server';
import { sendDynamicEmail } from '@/lib/actions/email-actions';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { formType, data } = body;

    // Validate input
    if (!formType || !data) {
      return NextResponse.json({ success: false, error: 'Missing formType or data' }, { status: 400 });
    }

    // Send email - this runs on server in background
    const result = await sendDynamicEmail({
      formType: formType as 'contact' | 'quote' | 'booking' | 'custom',
      data,
    });

    if (result.success) {
      return NextResponse.json({ success: true, messageId: result.messageId });
    } else {
      console.error(`❌ ${formType} email failed:`, result.error);
      return NextResponse.json({ success: false, error: result.error }, { status: 500 });
    }
  } catch (error) {
    console.error('Email API error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to send email' },
      { status: 500 }
    );
  }
}
