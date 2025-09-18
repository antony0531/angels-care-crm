import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { allSettingsSchema } from '@/lib/validation/settings-schemas';
import { z } from 'zod';

// GET /api/settings - Fetch all settings
export async function GET() {
  try {
    // Fetch all settings concurrently
    const [
      leadStatuses,
      leadSources,
      customFields,
      scoringRules,
      assignmentRules,
      crmSettings
    ] = await Promise.all([
      prisma.leadStatusConfig.findMany({ 
        where: { isActive: true },
        orderBy: { order: 'asc' }
      }),
      prisma.leadSourceConfig.findMany({ 
        where: { isActive: true },
        orderBy: { createdAt: 'asc' }
      }),
      prisma.customFieldConfig.findMany({ 
        where: { isActive: true },
        orderBy: { order: 'asc' }
      }),
      prisma.leadScoringRule.findMany({ 
        where: { isActive: true },
        orderBy: { order: 'asc' }
      }),
      prisma.assignmentRule.findMany({ 
        where: { isActive: true },
        orderBy: { priority: 'desc' }
      }),
      prisma.crmSettings.findUnique({ 
        where: { id: 'default' }
      })
    ]);

    // Transform database data to match frontend schema
    const settings = {
      statuses: leadStatuses.map(status => ({
        id: status.id,
        name: status.name,
        color: status.color as "blue" | "yellow" | "purple" | "green" | "red" | "gray",
        order: status.order,
        isDefault: status.isDefault
      })),
      sources: leadSources.map(source => ({
        id: source.id,
        name: source.name,
        type: source.type,
        isActive: source.isActive
      })),
      customFields: customFields.map(field => ({
        id: field.id,
        name: field.name,
        type: field.type,
        isRequired: field.isRequired,
        options: field.options,
        order: field.order || 0
      })),
      scoring: scoringRules.map(rule => ({
        id: rule.id,
        action: rule.action,
        points: rule.points,
        order: rule.order || 0
      })),
      assignment: assignmentRules.map(rule => ({
        id: rule.id,
        name: rule.name,
        conditions: rule.conditions,
        assignTo: rule.assignTo,
        priority: rule.priority || 0
      })),
      notifications: {
        emailNotifications: crmSettings?.emailNotifications ?? true,
        smsNotifications: crmSettings?.smsNotifications ?? false,
        webhookNotifications: crmSettings?.webhookNotifications ?? false,
        notificationEmail: crmSettings?.notificationEmail ?? "",
        smsNumber: crmSettings?.smsNumber ?? "",
        dailyDigest: crmSettings?.dailyDigest ?? false,
        instantAlerts: crmSettings?.instantAlerts ?? true
      },
      integrations: {
        webhookUrl: crmSettings?.webhookUrl ?? "",
        apiKey: crmSettings?.apiKey ?? "",
        enableWebhooks: crmSettings?.enableWebhooks ?? false,
        retryFailedCalls: crmSettings?.retryFailedCalls ?? true,
        maxRetries: crmSettings?.maxRetries ?? 3
      },
      importExport: {
        importSource: crmSettings?.importSource ?? "csv",
        exportFormat: crmSettings?.exportFormat ?? "csv",
        autoExport: crmSettings?.autoExport ?? false,
        exportFrequency: crmSettings?.exportFrequency ?? "weekly",
        includeArchived: crmSettings?.includeArchived ?? false
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

// POST /api/settings - Save all settings
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate the request body
    const validationResult = allSettingsSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Validation failed',
          details: validationResult.error.errors
        },
        { status: 400 }
      );
    }

    const settings = validationResult.data;

    // Use a transaction to ensure all updates succeed or fail together
    const result = await prisma.$transaction(async (tx) => {
      // 1. Update Lead Status Configurations
      if (settings.statuses && settings.statuses.length > 0) {
        // First, mark all existing statuses as inactive
        await tx.leadStatusConfig.updateMany({
          data: { isActive: false }
        });

        // Then upsert new/updated statuses
        for (const status of settings.statuses) {
          await tx.leadStatusConfig.upsert({
            where: { id: status.id || 'new-status' },
            create: {
              name: status.name,
              color: status.color,
              order: status.order,
              isDefault: status.isDefault,
              isActive: true
            },
            update: {
              name: status.name,
              color: status.color,
              order: status.order,
              isDefault: status.isDefault,
              isActive: true
            }
          });
        }
      }

      // 2. Update Lead Source Configurations
      if (settings.sources && settings.sources.length > 0) {
        await tx.leadSourceConfig.updateMany({
          data: { isActive: false }
        });

        for (const source of settings.sources) {
          await tx.leadSourceConfig.upsert({
            where: { id: source.id || 'new-source' },
            create: {
              name: source.name,
              type: source.type,
              isActive: source.isActive
            },
            update: {
              name: source.name,
              type: source.type,
              isActive: source.isActive
            }
          });
        }
      }

      // 3. Update Custom Field Configurations
      if (settings.customFields && settings.customFields.length > 0) {
        await tx.customFieldConfig.updateMany({
          data: { isActive: false }
        });

        for (const field of settings.customFields) {
          await tx.customFieldConfig.upsert({
            where: { id: field.id || 'new-field' },
            create: {
              name: field.name,
              type: field.type,
              isRequired: field.isRequired,
              options: field.options,
              order: field.order,
              isActive: true
            },
            update: {
              name: field.name,
              type: field.type,
              isRequired: field.isRequired,
              options: field.options,
              order: field.order,
              isActive: true
            }
          });
        }
      }

      // 4. Update Lead Scoring Rules
      if (settings.scoring && settings.scoring.length > 0) {
        await tx.leadScoringRule.updateMany({
          data: { isActive: false }
        });

        for (const rule of settings.scoring) {
          await tx.leadScoringRule.upsert({
            where: { id: rule.id || 'new-rule' },
            create: {
              action: rule.action,
              points: rule.points,
              order: rule.order,
              isActive: true
            },
            update: {
              action: rule.action,
              points: rule.points,
              order: rule.order,
              isActive: true
            }
          });
        }
      }

      // 5. Update Assignment Rules
      if (settings.assignment && settings.assignment.length > 0) {
        await tx.assignmentRule.updateMany({
          data: { isActive: false }
        });

        for (const rule of settings.assignment) {
          await tx.assignmentRule.upsert({
            where: { id: rule.id || 'new-assignment' },
            create: {
              name: rule.name,
              conditions: rule.conditions,
              assignTo: rule.assignTo,
              priority: rule.priority,
              isActive: true
            },
            update: {
              name: rule.name,
              conditions: rule.conditions,
              assignTo: rule.assignTo,
              priority: rule.priority,
              isActive: true
            }
          });
        }
      }

      // 6. Update CRM Settings (Singleton)
      await tx.crmSettings.upsert({
        where: { id: 'default' },
        create: {
          id: 'default',
          emailNotifications: settings.notifications.emailNotifications,
          smsNotifications: settings.notifications.smsNotifications,
          webhookNotifications: settings.notifications.webhookNotifications,
          notificationEmail: settings.notifications.notificationEmail,
          smsNumber: settings.notifications.smsNumber,
          dailyDigest: settings.notifications.dailyDigest,
          instantAlerts: settings.notifications.instantAlerts,
          webhookUrl: settings.integrations.webhookUrl,
          apiKey: settings.integrations.apiKey,
          enableWebhooks: settings.integrations.enableWebhooks,
          retryFailedCalls: settings.integrations.retryFailedCalls,
          maxRetries: settings.integrations.maxRetries,
          importSource: settings.importExport.importSource,
          exportFormat: settings.importExport.exportFormat,
          autoExport: settings.importExport.autoExport,
          exportFrequency: settings.importExport.exportFrequency,
          includeArchived: settings.importExport.includeArchived
        },
        update: {
          emailNotifications: settings.notifications.emailNotifications,
          smsNotifications: settings.notifications.smsNotifications,
          webhookNotifications: settings.notifications.webhookNotifications,
          notificationEmail: settings.notifications.notificationEmail,
          smsNumber: settings.notifications.smsNumber,
          dailyDigest: settings.notifications.dailyDigest,
          instantAlerts: settings.notifications.instantAlerts,
          webhookUrl: settings.integrations.webhookUrl,
          apiKey: settings.integrations.apiKey,
          enableWebhooks: settings.integrations.enableWebhooks,
          retryFailedCalls: settings.integrations.retryFailedCalls,
          maxRetries: settings.integrations.maxRetries,
          importSource: settings.importExport.importSource,
          exportFormat: settings.importExport.exportFormat,
          autoExport: settings.importExport.autoExport,
          exportFrequency: settings.importExport.exportFrequency,
          includeArchived: settings.importExport.includeArchived
        }
      });

      return { success: true };
    });

    return NextResponse.json({
      success: true,
      message: 'Settings saved successfully'
    });

  } catch (error) {
    console.error('Settings save error:', error);
    
    // Handle specific database errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Validation error',
          details: error.errors
        },
        { status: 400 }
      );
    }

    if (error.code === 'P2002') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Duplicate entry detected',
          details: 'A setting with this configuration already exists'
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to save settings',
        details: error instanceof Error ? error.message : 'Unknown database error'
      },
      { status: 500 }
    );
  }
}

// PATCH /api/settings - Partial update for specific setting sections
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { section, data } = body;

    if (!section || !data) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Section and data are required for partial updates'
        },
        { status: 400 }
      );
    }

    switch (section) {
      case 'notifications':
        await prisma.crmSettings.upsert({
          where: { id: 'default' },
          create: { id: 'default', ...data },
          update: data
        });
        break;

      case 'integrations':
        await prisma.crmSettings.upsert({
          where: { id: 'default' },
          create: { id: 'default', ...data },
          update: data
        });
        break;

      case 'importExport':
        await prisma.crmSettings.upsert({
          where: { id: 'default' },
          create: { id: 'default', ...data },
          update: data
        });
        break;

      default:
        return NextResponse.json(
          { 
            success: false, 
            error: `Unsupported section: ${section}`
          },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      message: `${section} settings updated successfully`
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