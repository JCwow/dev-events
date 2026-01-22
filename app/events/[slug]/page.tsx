import React, { Suspense } from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import BookEvent from "@/components/BookEvent";
import { IEvent } from "@/database";
import { getSimilarEventsBySlug } from "@/lib/actions/event.actions";
import EventCards from "@/components/EventCards";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

/* ---------------------------
   Reusable components
---------------------------- */

const EventDetailItem = ({
                             icon,
                             alt,
                             label,
                         }: {
    icon: string;
    alt: string;
    label: string;
}) => (
    <div className="flex-row-gap-2 items-center">
        <Image src={icon} alt={alt} width={17} height={17} unoptimized />
        <p>{label}</p>
    </div>
);

const EventAgenda = ({ agendaItems }: { agendaItems: string[] }) => (
    <div className="agenda">
        <h2>Agenda</h2>
        <ul>
            {agendaItems.map((item) => (
                <li key={item}>{item}</li>
            ))}
        </ul>
    </div>
);

const EventTags = ({ tags }: { tags: string[] }) => (
    <div className="flex flex-row gap-1.5 flex-wrap">
        {tags.map((tag) => (
            <div className="pill" key={tag}>
                {tag}
            </div>
        ))}
    </div>
);

const normalizeStringList = (value: unknown): string[] => {
    if (Array.isArray(value)) {
        if (
            value.length === 1 &&
            typeof value[0] === "string" &&
            value[0].trim().startsWith("[") &&
            value[0].trim().endsWith("]")
        ) {
            try {
                const parsed = JSON.parse(value[0]);
                return Array.isArray(parsed) ? parsed.map(String) : value.map(String);
            } catch {
                return value.map(String);
            }
        }
        return value.map(String);
    }

    if (typeof value === "string") {
        try {
            const parsed = JSON.parse(value);
            return Array.isArray(parsed) ? parsed.map(String) : [value];
        } catch {
            return [value];
        }
    }

    return [];
};

/* ---------------------------
   DATA COMPONENT
---------------------------- */

async function EventDetailsContent({
                                       params,
                                   }: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;

    const request = await fetch(`${BASE_URL}/api/events/${slug}`, {
        cache: "no-store",
    });

    if (!request.ok) notFound();

    const data = await request.json();
    if (!data?.data) notFound();

    const bookings = 10;

    const similarEvents: IEvent[] = await getSimilarEventsBySlug(slug);

    const {
        description,
        image,
        overview,
        date,
        time,
        location,
        mode,
        agenda,
        audience,
        tags,
        organizer,
    } = data.data;

    const normalizedTags = normalizeStringList(tags);
    const normalizedAgenda = normalizeStringList(agenda);

    return (
        <>
            <div className="header">
                <h1>Event Description</h1>
                <p>{description}</p>
            </div>

            <div className="details">
                {/* Left Side - Event Content */}
                <div className="content">
                    <Image
                        src={image}
                        alt="Event Banner"
                        width={800}
                        height={800}
                        className="banner"
                    />

                    <section className="flex-col-gap-2">
                        <h2>Overview</h2>
                        <p>{overview}</p>
                    </section>

                    <section className="flex-col">
                        <h2>Event Details</h2>
                        <EventDetailItem icon="/icons/calendar.svg" alt="calendar" label={date} />
                        <EventDetailItem icon="/icons/clock.svg" alt="clock" label={time} />
                        <EventDetailItem icon="/icons/pin.svg" alt="pin" label={location} />
                        <EventDetailItem icon="/icons/mode.svg" alt="mode" label={mode} />
                        <EventDetailItem icon="/icons/audience.svg" alt="audience" label={audience} />
                    </section>

                    <EventAgenda agendaItems={normalizedAgenda} />

                    <section className="flex-col-gap-2">
                        <h2>About the Organizer</h2>
                        <p>{organizer}</p>
                    </section>

                    <EventTags tags={normalizedTags} />
                </div>

                {/* Right Side - Booking */}
                <aside className="booking">
                    <div className="signup-card">
                        <h2>Book Your Spot</h2>

                        {bookings > 0 ? (
                            <p className="text-sm">
                                Join {bookings} people who have already booked their spot!
                            </p>
                        ) : (
                            <p className="text-sm">Be the first to book your spot!</p>
                        )}

                        <BookEvent eventId={String(data.data._id)} slug={slug} />
                    </div>
                </aside>
            </div>

            {/* Similar events */}
            <div className="flex w-full flex-col gap-4 pt-20">
                <h2>Similar Events</h2>

                <div className="events">
                    {similarEvents.map((event) => (
                        <EventCards
                            key={event.slug}
                            title={event.title}
                            image={event.image}
                            slug={event.slug}
                            location={event.location}
                            date={event.date}
                            time={event.time}
                        />
                    ))}
                </div>
            </div>
        </>
    );
}

/* ---------------------------
   PAGE (no runtime access)
---------------------------- */

export default function EventDetailsPage({
                                             params,
                                         }: {
    params: Promise<{ slug: string }>;
}) {
    return (
        <section id="event">
            <Suspense fallback={<p>Loading event…</p>}>
                <EventDetailsContent params={params} />
            </Suspense>
        </section>
    );
}