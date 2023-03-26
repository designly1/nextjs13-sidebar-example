Most of the design systems, such as Material UI and Ant Design have drawer-like elements that allow you to create animated sliding sidebars, but many, myself included, find these design systems to be limiting. They also introduce a ton of overhead in dependency code base.

During any web development project, I am always looking for places where layers of abstraction and dependencies can be eliminated, especially when the underlying task that the layer of abstraction is producing is relatively simple. Well, good news: a responsive sidebar is one of those things! 🤗

In this tutorial, I'll show you how to leverage the power of Tailwind CSS and Next.js to create a simple yet elegant mobile-responsive sidebar using no other dependencies. (I am using `react-icons` for this example, but you can use whatever you like.)

***

The first thing we'll want to do is create a folder called Layout in our components folder. This folder will house all the components required to render our sidebar, mobile menu bar and the main layout component.

Next, let's create our sidebar component:

```jsx
// @/components/Layout/Sidebar.js
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'

import { SlHome } from 'react-icons/sl'
import { BsInfoSquare, BsEnvelopeAt } from 'react-icons/bs'
import { FaTshirt, FaRedhat } from 'react-icons/fa'

import logo from '@/img/logo.svg'

export default function Sidebar({ show, setter }) {
    const router = useRouter();

    // Define our base class
    const className = "bg-black w-[250px] transition-[margin-left] ease-in-out duration-500 fixed md:static top-0 bottom-0 left-0 z-40";
    // Append class based on state of sidebar visiblity
    const appendClass = show ? " ml-0" : " ml-[-250px] md:ml-0";

    // Clickable menu items
    const MenuItem = ({ icon, name, route }) => {
        // Highlight menu item based on currently displayed route
        const colorClass = router.pathname === route ? "text-white" : "text-white/50 hover:text-white";

        return (
            <Link
                href={route}
                onClick={() => {
                    setter(oldVal => !oldVal);
                }}
                className={`flex gap-1 [&>*]:my-auto text-md pl-6 py-3 border-b-[1px] border-b-white/10 ${colorClass}`}
            >
                <div className="text-xl flex [&>*]:mx-auto w-[30px]">
                    {icon}
                </div>
                <div>{name}</div>
            </Link>
        )
    }

    // Overlay to prevent clicks in background, also serves as our close button
    const ModalOverlay = () => (
        <div
            className={`flex md:hidden fixed top-0 right-0 bottom-0 left-0 bg-black/50 z-30`}
            onClick={() => {
                setter(oldVal => !oldVal);
            }}
        />
    )

    return (
        <>
            <div className={`${className}${appendClass}`}>
                <div className="p-2 flex">
                    <Link href="/">
                        {/*eslint-disable-next-line*/}
                        <img src={logo.src} alt="Company Logo" width={300} height={300} />
                    </Link>
                </div>
                <div className="flex flex-col">
                    <MenuItem
                        name="Home"
                        route="/"
                        icon={<SlHome />}
                    />
                    <MenuItem
                        name="T-Shirts"
                        route="/t-shirts"
                        icon={<FaTshirt />}
                    />
                    <MenuItem
                        name="Hats"
                        route="/hats"
                        icon={<FaRedhat />}
                    />
                    <MenuItem
                        name="About Us"
                        route="/about"
                        icon={<BsInfoSquare />}
                    />
                    <MenuItem
                        name="Contact"
                        route="/contact"
                        icon={<BsEnvelopeAt />}
                    />
                </div>
            </div>
            {show ? <ModalOverlay /> : <></>}
        </>
    )
}
```

Ok, let's break this down. This component receives two props: `show` and `setter`. These are passed from the HOC `Layout`, which we will define later. The `show` prop is a boolean variable that toggles the state of the sidebar's visibility. The `setter` prop is the function to set that state.

Next we define our base class and another variable called `appendClass`, which will be conditionally rendered based on our `show` state variable. When `show` is false, we set the left margin to -250px but we set it to 0 on medium screens or larger. We also set the transition property in our base class to a custom value of `[margin-left]`, which will cause the browser to automagically animate our sidebar as a slide animation! 😁

Then we define a subcomponent called `<MenuItem>` which will be used for our links. We use `next/router` to determine which link we should highlight as active. Also, we toggle the setter function when a menu item is clicked to the sidebar closes. This is required because this is a single-page app, and it would be annoying if the sidebar stayed open when you click a link.

Finally, we have `<ModalOverlay>`, which serves two purposes: 1.) it prevents clicking of anything in the background while the sidebar is open, and 2.) it serves as the close button for the sidebar. You could also add an additional visible close button as well, but I think that touching in the outside bound areas of modals on mobile UIs is a very intuitive and natural function, so I opted not to include one.
***

Ok, now we'll create our mobile menu bar component that will only displayed on screens smaller than the medium breakpoint:

```jsx
// @/components/Layout/MenuBarMobile.js
import React from 'react'
import Link from 'next/link'
import { FiMenu as Icon } from 'react-icons/fi'
import { FaUser } from 'react-icons/fa'

import logo from '@/img/logo.svg'

export default function MenuBarMobile({ setter }) {
    return (
        <nav className="md:hidden z-20 fixed top-0 left-0 right-0 h-[60px] bg-black flex [&>*]:my-auto px-2">
            <button
                className="text-4xl flex text-white"
                onClick={() => {
                    setter(oldVal => !oldVal);
                }}
            >
                <Icon />
            </button>
            <Link href="/" className="mx-auto">
                {/*eslint-disable-next-line*/}
                <img
                    src={logo.src}
                    alt="Company Logo"
                    width={50}
                    height={50}
                />
            </Link>
            <Link
                className="text-3xl flex text-white"
                href="/login"
            >
                <FaUser />
            </Link>
        </nav>
    )
}
```

This component has a fixed position at the top of the screen on mobile devices only. It serves primarily as a vehicle for our sidebar opener button. I put the login button there simply for illustration and symmetry. We need only to pass the `setter` function of our `showSidebar` state to this component.

***

Lastly, let's create our `Layout` component that will bring it all together:

```jsx
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
```

As you can see, this is where we define our `showSidebar` state variable. We then pass it to `<MenuBarMobile>` and `<Sidebar>`.

***

Thank you for taking the time to read my article and I hope you found it useful (or at the very least, mildly entertaining). For more great information about web dev, systems administration and cloud computing, please read the [Designly Blog](https://designly.biz/blog). Also, please leave your comments! I love to hear thoughts from my readers.

Looking for a web developer? I'm available for hire! To inquire, please fill out a [contact form](https://designly.biz/contact).

***

Resources for this tutorial:

1. [GitHub Repo](https://github.com/designly1/nextjs13-sidebar-example)
2. [Demo Page](https://nextjs13-sidebar-example.vercel.app/)