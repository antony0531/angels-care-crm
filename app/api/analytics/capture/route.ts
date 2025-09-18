import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

// POST capture analytics event
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const headersList = await headers();
    
    const {
      sessionId,
      visitorId,
      url,
      path,
      title,
      referrer,
      duration,
      bounced = false,
      // UTM parameters
      utmSource,
      utmMedium,
      utmCampaign,
      utmTerm,
      utmContent,
    } = body;

    // Get user agent info
    const userAgent = headersList.get('user-agent') || undefined;

    // Parse user agent for browser, device, OS
    const browser = parseUserAgent(userAgent).browser;
    const device = parseUserAgent(userAgent).device;
    const os = parseUserAgent(userAgent).os;

    // Create analytics record
    await prisma.analytics.create({
      data: {
        sessionId,
        visitorId,
        url,
        path,
        title,
        referrer,
        userAgent,
        browser,
        device,
        os,
        duration,
        bounced,
        utmSource,
        utmMedium,
        utmCampaign,
        utmTerm,
        utmContent,
      },
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('Error capturing analytics:', error);
    return NextResponse.json(
      { error: 'Failed to capture analytics' },
      { status: 500 }
    );
  }
}

// GET analytics data with aggregations
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const path = searchParams.get('path');

    const where: any = {};
    
    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }
    
    if (path) {
      where.path = path;
    }

    // Get basic analytics
    const [pageViews, uniqueVisitors, sessions, avgDuration] = await Promise.all([
      // Total page views
      prisma.analytics.count({ where }),
      
      // Unique visitors
      prisma.analytics.findMany({
        where,
        distinct: ['visitorId'],
        select: { visitorId: true },
      }).then(visitors => visitors.length),
      
      // Total sessions
      prisma.analytics.findMany({
        where,
        distinct: ['sessionId'],
        select: { sessionId: true },
      }).then(sessions => sessions.length),
      
      // Average duration
      prisma.analytics.aggregate({
        where: {
          ...where,
          duration: { not: null },
        },
        _avg: { duration: true },
      }),
    ]);

    // Get top pages
    const topPages = await prisma.analytics.groupBy({
      by: ['path', 'title'],
      where,
      _count: true,
      orderBy: { _count: { path: 'desc' } },
      take: 10,
    });

    // Get traffic sources
    const trafficSources = await prisma.analytics.groupBy({
      by: ['utmSource', 'utmMedium'],
      where: {
        ...where,
        utmSource: { not: null },
      },
      _count: true,
      orderBy: { _count: { utmSource: 'desc' } },
      take: 10,
    });

    // Get bounce rate
    const bouncedSessions = await prisma.analytics.count({
      where: {
        ...where,
        bounced: true,
      },
    });
    const bounceRate = sessions > 0 ? (bouncedSessions / sessions) * 100 : 0;

    return NextResponse.json({
      overview: {
        pageViews,
        uniqueVisitors,
        sessions,
        avgDuration: avgDuration._avg.duration || 0,
        bounceRate: bounceRate.toFixed(2),
      },
      topPages: topPages.map(page => ({
        path: page.path,
        title: page.title,
        views: page._count,
      })),
      trafficSources: trafficSources.map(source => ({
        source: source.utmSource || 'Direct',
        medium: source.utmMedium || 'None',
        visits: source._count,
      })),
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}

// Simple user agent parser
function parseUserAgent(userAgent?: string) {
  if (!userAgent) {
    return { browser: 'Unknown', device: 'Unknown', os: 'Unknown' };
  }

  let browser = 'Unknown';
  let device = 'Desktop';
  let os = 'Unknown';

  // Browser detection
  if (userAgent.includes('Chrome')) browser = 'Chrome';
  else if (userAgent.includes('Safari')) browser = 'Safari';
  else if (userAgent.includes('Firefox')) browser = 'Firefox';
  else if (userAgent.includes('Edge')) browser = 'Edge';

  // Device detection
  if (userAgent.includes('Mobile')) device = 'Mobile';
  else if (userAgent.includes('Tablet')) device = 'Tablet';

  // OS detection
  if (userAgent.includes('Windows')) os = 'Windows';
  else if (userAgent.includes('Mac')) os = 'macOS';
  else if (userAgent.includes('Linux')) os = 'Linux';
  else if (userAgent.includes('Android')) os = 'Android';
  else if (userAgent.includes('iOS')) os = 'iOS';

  return { browser, device, os };
}