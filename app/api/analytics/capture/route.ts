import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

export const dynamic = 'force-dynamic';

// POST /api/analytics/capture - Capture analytics event
export async function POST(request: Request) {
  try {
    const data = await request.json();
    const headersList = await headers();

    const {
      event,
      page,
      referrer,
      userAgent,
      timestamp,
      sessionId,
      userId,
      properties = {},
    } = data;

    // Validate required fields
    if (!event || !page) {
      return NextResponse.json(
        { error: 'Event and page are required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get IP and other details from headers
    const ip = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'unknown';
    const ua = userAgent || headersList.get('user-agent') || '';

    // Store analytics event
    const { error: analyticsError } = await supabase
      .from('analytics')
      .insert({
        event_name: event,
        page_url: page,
        referrer: referrer || null,
        user_agent: ua,
        ip_address: ip,
        session_id: sessionId,
        user_id: userId,
        properties: properties,
        timestamp: timestamp || new Date().toISOString(),
        created_at: new Date().toISOString(),
      });

    if (analyticsError) {
      console.error('Analytics capture error:', analyticsError);
      return NextResponse.json(
        { error: 'Failed to capture analytics' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Analytics capture error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/analytics/capture - Get analytics data with aggregations
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const event = searchParams.get('event');

    const supabase = await createClient();

    // Build base query
    let query = supabase.from('analytics').select('*');

    // Apply date filters
    if (startDate) {
      query = query.gte('timestamp', startDate);
    }
    if (endDate) {
      query = query.lte('timestamp', endDate);
    }
    if (event) {
      query = query.eq('event_name', event);
    }

    const { data: analytics, error } = await query.order('timestamp', { ascending: false });

    if (error) {
      console.error('Analytics fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch analytics' },
        { status: 500 }
      );
    }

    // Calculate basic metrics
    const totalEvents = analytics?.length || 0;
    const uniquePages = new Set(analytics?.map(a => a.page_url)).size;
    const uniqueSessions = new Set(analytics?.map(a => a.session_id).filter(Boolean)).size;

    // Group by event type
    const eventCounts = analytics?.reduce((acc: any, event: any) => {
      acc[event.event_name] = (acc[event.event_name] || 0) + 1;
      return acc;
    }, {}) || {};

    // Group by page
    const pageCounts = analytics?.reduce((acc: any, event: any) => {
      acc[event.page_url] = (acc[event.page_url] || 0) + 1;
      return acc;
    }, {}) || {};

    // Top referrers
    const referrerCounts = analytics?.reduce((acc: any, event: any) => {
      if (event.referrer) {
        acc[event.referrer] = (acc[event.referrer] || 0) + 1;
      }
      return acc;
    }, {}) || {};

    return NextResponse.json({
      summary: {
        totalEvents,
        uniquePages,
        uniqueSessions,
      },
      eventCounts,
      pageCounts,
      referrerCounts,
      recentEvents: analytics?.slice(0, 50) || [],
    });

  } catch (error) {
    console.error('Analytics fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}