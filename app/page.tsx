import React from 'react'
import ExploreBtn from "@/components/ExploreBtn";
import EventCards from "@/components/EventCards";
import {IEvent} from "@/database";
import {cacheLife} from "next/cache";
import {headers} from "next/headers";

export const dynamic = 'force-dynamic';

const getBaseUrl = async () => {
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL;
  }

  const headerList = await headers();
  const host = headerList.get('host');
  const proto = headerList.get('x-forwarded-proto') ?? 'http';

  if (host) {
    return `${proto}://${host}`;
  }

  return 'http://localhost:3000';
};

const page = async () => {
    'use cache';
    cacheLife('hours')
    const baseUrl = await getBaseUrl();
    const response = await fetch(`${baseUrl}/api/events`, { cache: 'no-store' });
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch events: ${response.status} ${errorText}`);
    }

    const contentType = response.headers.get('content-type') ?? '';
    if (!contentType.includes('application/json')) {
        const errorText = await response.text();
        throw new Error(`Invalid JSON response: ${errorText}`);
    }

    const {events} = await response.json();

    return (
    <section>
      <h1 className="text-center">The Hub for Every Dev <br/> Event You Can't Miss</h1>
      <p className="text-center mt-5">Hackathon, Meetups, and Conference, All in One Place</p>
      <ExploreBtn/>
      <div className="mt-20 space-y-7">
        <h3>Featured Events</h3>
        <ul className={"events"}>
          {events && events.length > 0 &&  events.map((event:IEvent) => (
              <li key={event.title}>
              <EventCards {...event}/>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export default page