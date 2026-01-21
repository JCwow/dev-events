import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Event } from '@/database';

interface RouteParams {
  params: {
    slug: string;
  };
}

/**
 * GET /api/events/[slug]
 * Fetches a single events by its unique slug
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    // Connect to database
    await connectDB();

    // Await and extract slug from params
    const { slug } = await params;

    // Validate slug parameter
    if (!slug || typeof slug !== 'string' || slug.trim() === '') {
      return NextResponse.json(
        { error: 'Invalid or missing slug parameter' },
        { status: 400 }
      );
    }

    // Sanitize slug (remove any potential malicious input)
    const sanitizedSlug = slug.trim().toLowerCase();

    // Query events by slug
    const event = await Event.findOne({ slug: sanitizedSlug }).lean();

    // Handle events not found
    if (!event) {
      return NextResponse.json(
        { message: `Event with slug '${sanitizedSlug}' not found`},
        { status: 404 }
      );
    }

    // Return events data
    return NextResponse.json(
      { message: 'Event fetched successfully', data: event },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('MONGODB_URI')) {
        return NextResponse.json(
        {
          message: 'Database configuration error'
        }
      ,
        {
          status: 500
        }
      );
      }
    }

    // Return generic error message (avoid exposing internal details)
    return NextResponse.json(
      { error: 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}