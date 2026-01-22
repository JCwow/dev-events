import React from 'react'
import ExploreBtn from "@/components/ExploreBtn";
import EventCards from "@/components/EventCards";
import {Event, IEvent} from "@/database";
import {cacheLife} from "next/cache";
import connectDB from "@/lib/mongodb";

const getEvents = async () => {
    'use cache';
    cacheLife('hours');
    await connectDB();
    const events = await Event.find().sort({createdAt: -1}).lean();
    return JSON.parse(JSON.stringify(events)) as IEvent[];
};

const page = async () => {
    const events = await getEvents();

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