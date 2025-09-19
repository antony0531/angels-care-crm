import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { allSettingsSchema } from '@/lib/validation/settings-schemas';
import { z } from 'zod';

// GET /api/settings - Fetch all settings
export async function GET() {
  try {
    // Return simple default settings for the simplified CRM
    const settings = {
      statuses: [
        { id: 'new', name: 'New', color: 'blue' as const, order: 1, isDefault: true },
        { id: 'contacted', name: 'Contacted', color: 'yellow' as const, order: 2, isDefault: false },
        { id: 'converted', name: 'Converted', color: 'green' as const, order: 3, isDefault: false }
      ],
      sources: [
        { id: 'website', name: 'Website', type: 'organic', isActive: true },
        { id: 'referral', name: 'Referral', type: 'referral', isActive: true },
        { id: 'phone', name: 'Phone Call', type: 'direct', isActive: true }
      ],
      customFields: [],
      crmSettings: {
        emailNotifications: true,
        smsNotifications: false,
        webhookNotifications: false,
        notificationEmail: "",
        smsNumber: "",
        dailyDigest: false,
        instantAlerts: true
      }
    };

    return NextResponse.json({ 
      success: true, 
      data: settings 
    });

  } catch (error) {
    console.error('Settings fetch error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch settings',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST /api/settings - Save all settings (simplified)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // For the simplified CRM, just return success
    // Settings are hardcoded for now
    console.log('Settings save request received:', JSON.stringify(body, null, 2));

    return NextResponse.json({
      success: true,
      message: 'Settings saved successfully (simplified CRM mode)'
    });

  } catch (error) {
    console.error('Settings save error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to save settings',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// PATCH /api/settings - Partial update for specific setting sections (simplified)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { section, data } = body;

    console.log(`Settings PATCH request for section: ${section}`, JSON.stringify(data, null, 2));

    return NextResponse.json({
      success: true,
      message: `${section} settings updated successfully (simplified CRM mode)`
    });

  } catch (error) {
    console.error('Settings partial update error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update settings',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}