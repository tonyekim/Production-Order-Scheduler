# Production Order Scheduler - Phase 1

A web application to manage and schedule production orders, built for the React Coding Challenge (Phase 1).

## Table of Contents

- [Setup Instructions](#setup-instructions)
- [Features Implemented (Phase 1)](#features-implemented-phase-1)
- [Testing Approach](#testing-approach)
- [Technical Decisions](#technical-decisions)
- [Known Issues/Limitations](#known-issueslimitations)
- [Bonus Features](#bonus-features)

## Setup Instructions

1.  **Clone the repository:**
    ```bash
    git clone <your-repo-url>
    cd production-order-scheduler
    ```

2.  **Install Node.js and npm/yarn:**
    Ensure you have Node.js (v18.x or later recommended) and a package manager (npm or yarn) installed.

3.  **Install project dependencies:**
    ```bash
    npm install
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:3000`.

5.  **Run Playwright tests:**
    First, install Playwright browsers:
    ```bash
    npx playwright install
    ```
    Then, run the tests:
    ```bash
    npm run test:e2e
    # or
    yarn test:e2e
    ```
    You can also run them in headed mode or with the UI:
    ```bash
    npm run test:e2e:headed
    npm run test:e2e:ui
    # or
    yarn test:e2e:headed
    yarn test:e2e:ui
    ```

## Features Implemented (Phase 1)

* **Predefined Resources:** A static list of manufacturing resources is available in the application.
    * Each resource has an ID, name, and status ('Available', 'Busy', 'Maintenance').
* **Production Order Management & Scheduling:**
    * **Create Order:** Users can create new production orders with a name, status ('Pending' by default), and optional notes.
    * **Edit Order:** Existing 'Pending' orders can be edited to assign a resource, set start and end times, and change the status to 'Scheduled'.
    * **View Orders:** A table displays all production orders with relevant details, including the assigned resource name, start/end times, and status.
    * **Filter Orders:** The order table can be filtered by order status.
* **Scheduling Validation:**
    * The order form prevents scheduling if the End Time is not after the Start Time.
    * Orders can only be scheduled on 'Available' resources.
* **Dashboard:**
    * A simple dashboard page displaying:
        * A bar chart showing the count of orders by status.
        * A bar chart showing resource utilization (how many orders are scheduled per resource).
* **Responsive UI:** Basic responsiveness using Tailwind CSS.

## Testing Approach

End-to-End (E2E) tests are implemented using Playwright. The tests cover the following key user flows:

* **Order Creation:**
    * Successfully creating a 'Pending' order with valid data.
    * Displaying validation errors for invalid data (e.g., empty order name).
* **Order Editing & Scheduling:**
    * Editing an existing 'Pending' order.
    * Assigning a resource and valid start/end times.
    * Changing the order status to 'Scheduled'.
    * Verifying the updated order details (including resource name) in the orders table.
* **Scheduling Validation:**
    * Attempting to schedule an order where End Time is before or same as Start Time, and verifying form rejection.
    * Attempting to schedule an order on a 'Busy' or 'Maintenance' resource, and verifying form rejection or warning (currently implemented as preventing selection).
* **Table Interaction:**
    * Filtering the orders table by 'Scheduled' status and verifying the results.
    * Filtering by 'Pending' status.
* **Dashboard Display:**
    * Verifying that the Order Status chart renders.
    * Verifying that the chart reflects the current state of production orders (e.g., after adding a new order).

Tests are located in the `tests/e2e` directory.

## Technical Decisions

* **Framework:** Next.js 14 with App Router for its robust routing, server components, and overall developer experience.
* **Language:** TypeScript for type safety and improved code maintainability.
* **Styling:** Tailwind CSS for utility-first styling, enabling rapid UI development.
* **UI Components:** shadcn/ui for its accessible, customizable, and unstyled components that integrate seamlessly with Tailwind CSS. Components are added individually as needed.
* **Data Display:** Tanstack Table (React Table v8) for its headless, powerful, and flexible table creation capabilities.
* **Data Visualization:** Recharts for creating simple, declarative charts on the dashboard.
* **Form Validation:** Zod for schema-based validation, integrated with React Hook Form for a robust form handling experience.
* **State Management:** Zustand for simple, scalable in-memory state management. It's less boilerplate than Context API for this scale and easy to use.
* **E2E Testing:** Playwright for its reliability, speed, and powerful features for end-to-end testing.

## Known Issues/Limitations (Phase 1)

* **In-Memory State:** Data is not persistent. Refreshing the browser will reset the application state to its initial state.
* **No Real-time Updates:** Changes made in one browser tab/window will not reflect in another without a refresh.
* **Basic Conflict Detection:** Currently, the form only allows scheduling on 'Available' resources. It doesn't do advanced time-slot conflict detection (e.g., if two orders are scheduled on the same resource at overlapping times). This is a target for Phase 2.
* **Limited Error Handling:** Basic error messages are in place, but comprehensive error handling for all scenarios is not fully implemented.
* **Time Zones:** Time zone handling is not explicitly managed and relies on browser defaults.
* **Resource CRUD:** Resources are predefined and cannot be managed by the user (target for Phase 2).

## Bonus Features

## Phase 2 Setup SQLite database Instructions 
* (Phase 2 Implemented)

1. Install dependencies: `npm install`.
2. Set up SQLite database:
   - Create `.env` with `DATABASE_URL="file:./dev.db"`.
   - Run `npx prisma migrate dev` to create tables.
   - Seed resources via `npx prisma studio` or `POST /api/resources`. 
   - Add `CNC Machine 1` and `Assembly Line A`
3. Run the app: `npm run dev`.
4. Run tests: `npx playwright test`.



## Known Issues/Limitations (Phase 2)

- **Resource Seeding Required**: The application requires resources to be seeded in the SQLite database using `npx prisma studio` before production orders can be scheduled. Without seeded resources, the order form's resource dropdown will be empty, preventing scheduling.
- **Conflict Detection**: Currently checks for basic time overlaps but doesn’t account for complex scenarios (e.g., resource downtime or partial overlaps). This could be improved with more robust logic.
- **Error Handling**: API endpoints include basic error responses, but edge cases (e.g., database connection failures) need more comprehensive handling.
- **Performance**: Fetching all orders/resources in a single call may not scale well with large datasets; pagination could be added.
- **Time Zones**: Still reliant on browser defaults, which could lead to inconsistencies across users.
