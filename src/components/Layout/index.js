// @/components/Layout/index.js
import React, { useState } from 'react'
import Head from 'next/head'
import Sidebar from './Sidebar';
import MenuBarMobile from './MenuBarMobile';

export default function Layout({ pageTitle, children }) {
    // Concatenate page title (if exists) to site title
    let titleConcat = "Responsive Sidebar Example";
    if (pageTitle) titleConcat = pageTitle + " | " + titleConcat;

    // Mobile sidebar visibility state
    const [showSidebar, setShowSidebar] = useState(false);

    return (
        <>
            <Head>
                <title>{titleConcat}</title>
            </Head>
            <div className="min-h-screen">
                <div className="flex">
                    <MenuBarMobile setter={setShowSidebar} />
                    <Sidebar show={showSidebar} setter={setShowSidebar} />
                    <div className="flex flex-col flex-grow w-screen md:w-full min-h-screen">
                        {children}
                    </div>
                </div>
            </div>
        </>
    )
}