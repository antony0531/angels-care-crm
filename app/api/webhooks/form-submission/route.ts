import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import crypto from 'crypto';

// POST webhook for form submissions
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const headersList = await headers();
    
    // Verify webhook signature if configured
    const signature = headersList.get('x-webhook-signature');
    if (process.env.WEBHOOK_SECRET && signature) {
      const expectedSignature = crypto
        .createHmac('sha256', process.env.WEBHOOK_SECRET)
        .update(JSON.stringify(body))
        .digest('hex');
      
      if (signature !== expectedSignature) {
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 401 }
        );
      }
    }

    const {
      formId,
      data,
      url,
      ip,
      userAgent,
      // Lead data extracted from form
      email,
      name,
      phone,
      company,
      message,
    } = body;

    // Start a transaction to create/update lead and form submission
    const result = await prisma.$transaction(async (tx) => {
      // Check if lead exists
      let lead = await tx.lead.findUnique({
        where: { email },
      });

      if (!lead) {
        // Create new lead
        lead = await tx.lead.create({
          data: {
            email,
            name: name || 'Unknown',
            phone,
            company,
            source: 'WEBSITE',
            status: 'NEW',
            metadata: {
              firstMessage: message,
              formUrl: url,
            },
          },
        });

        // Create activity for new lead
        await tx.leadActivity.create({
          data: {
            leadId: lead.id,
            type: 'FORM_SUBMITTED',
            description: 'Lead created from form submission',
            metadata: { formId },
          },
        });
      } else {
        // Update existing lead
        await tx.lead.update({
          where: { id: lead.id },
          data: {
            lastContactAt: new Date(),
            score: {
              increment: 10, // Increase score for repeat engagement
            },
          },
        });

        // Create activity for existing lead
        await tx.leadActivity.create({
          data: {
            leadId: lead.id,
            type: 'FORM_SUBMITTED',
            description: 'Additional form submission',
            metadata: { formId },
          },
        });
      }

      // Create form submission record
      const submission = await tx.formSubmission.create({
        data: {
          formId: formId || 'default',
          data,
          url,
          ip,
          userAgent,
          leadId: lead.id,
        },
      });

      // Create webhook event record
      await tx.webhookEvent.create({
        data: {
          type: 'FORM_SUBMISSION',
          payload: body,
          status: 'SUCCESS',
          processedAt: new Date(),
        },
      });

      return { lead, submission };
    });

    // TODO: Send notification email to sales team
    // TODO: Send auto-response email to lead

    return NextResponse.json({
      success: true,
      leadId: result.lead.id,
      submissionId: result.submission.id,
    }, { status: 201 });
  } catch (error) {
    console.error('Webhook processing error:', error);
    
    // Log failed webhook
    try {
      await prisma.webhookEvent.create({
        data: {
          type: 'FORM_SUBMISSION',
          payload: await request.json().catch(() => ({})),
          status: 'FAILED',
          lastError: error instanceof Error ? error.message : 'Unknown error',
        },
      });
    } catch (logError) {
      console.error('Failed to log webhook error:', logError);
    }

    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
}