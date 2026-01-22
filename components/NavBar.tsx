'use client';

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef } from "react";

const NavBar = () => {
    const posthogRef = useRef<any>(null);

    useEffect(() => {
        import("posthog-js").then((ph) => {
            posthogRef.current = ph.default;

            posthogRef.current.init(
                process.env.NEXT_PUBLIC_POSTHOG_KEY!,
                {
                    api_host: "/ingest",
                }
            );
        });
    }, []);

    const handleNavClick = (navItem: string) => {
        posthogRef.current?.capture("nav_link_clicked", {
            nav_item: navItem,
        });
    };

    return (
        <header>
            <nav>
                <Link
                    href="/"
                    className="logo"
                    onClick={() => handleNavClick("logo")}
                >
                    <Image src="/icons/logo.png" alt="logo" width={24} height={24} />
                    <p>DevEvent</p>
                </Link>

                <ul>
                    <Link href="/" onClick={() => handleNavClick("Home")}>
                        Home
                    </Link>
                    <Link href="/" onClick={() => handleNavClick("Events")}>
                        Events
                    </Link>
                    <Link href="/" onClick={() => handleNavClick("Create Event")}>
                        Create Event
                    </Link>
                </ul>
            </nav>
        </header>
    );
};

export default NavBar;
