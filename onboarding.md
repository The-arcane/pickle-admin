# Lumen Platform Onboarding Guide

This guide provides a step-by-step process for setting up and using the Lumen platform, from the Super Admin level down to the individual organization administrators.

---

## Step 1: Super Admin Initial Setup

The Super Admin is responsible for creating the organizations and the primary admin users who will manage them.

### 1.1. Create an Admin User
Before you can create an organization, you need an admin user to assign as its owner.

1.  Navigate to **User Management > Admins** in the Super Admin dashboard.
2.  Click **Add Admin**.
3.  Fill in the user's details (Name, Email, Password). This user will have the "Admin" role (`user_type` = 2).
4.  Click **Create Admin User**.

### 1.2. Create an Organization (Living Space)
1.  Navigate to **Platform Management > Living Spaces**.
2.  Click **Add Living Space**.
3.  Fill in the organization's details (Name, Address).
4.  From the **Owner** dropdown, select the admin user you just created.
5.  Optionally, upload a logo.
6.  Click **Save Living Space**. The organization is created and automatically linked to its owner.

**Note:** The process is similar for creating **Schools**, **Hospitality** orgs, and **Arenas**. The Super Admin dashboard has separate sections for each. For these types, the system automatically creates the admin user and the organization in a single step.

---

## Step 2: Living Space Admin Onboarding

Once a Super Admin creates a Living Space and its admin, that admin can log in and begin setting up their community.

### 2.1. First Login
- Use the credentials created by the Super Admin to log in at the main login page.
- You will be automatically redirected to your Living Space dashboard.

### 2.2. Configure Your Living Space Profile
This step is crucial for defining the physical structure of your community, which is necessary for assigning residents to specific locations.

1.  Navigate to **Living Space** in the sidebar.
2.  Review and update the basic information (Name, Address, Logo).
3.  In the **Buildings & Flats** card:
    - Click **Add Building** to create a new building (e.g., "Tower A").
    - Once a building is created, expand its section and click **Add Wing/Block** (e.g., "A-Wing").
    - Click **Manage Flats** for a specific wing to add individual flat numbers (e.g., "101", "G-02").

### 2.3. Add Courts
Set up the bookable facilities for your community.

1.  Navigate to **Operations > Court List**.
2.  Click **+ Add Court**.
3.  Fill in all the required details, including:
    - **Court Info**: Name, Address, Sport Type.
    - **Availability**: Business hours and any recurring or one-off unavailable times.
    - **Booking Rules**: Booking window, rolling window options, etc.
    - **Images & Pricing**.
4.  Save the court.

### 2.4. Invite Residents
Now you can start inviting users to your community.

1.  Navigate to **Management > Invitations**.
2.  Click **Invite Residents**.
3.  Download the CSV template. The required columns are `Name` and `email`.
4.  Fill the CSV with resident data and upload it.
5.  Click **Send Invitations**. Residents will receive an invite to join your Living Space.

### 2.5. Approve Join Requests
When an invited user signs up, their request will appear in the approvals queue.

1.  Navigate to **Management > Approvals**.
2.  For each pending request, review the details.
3.  Use the dropdowns to assign the user to the correct **Building**, **Wing/Block**, and **Flat**. If a flat doesn't exist, you can add it directly from this dialog.
4.  Click **Approve**. The user is now a verified member of your Living Space.

---

## Step 3: Day-to-Day Operations (Living Space Admin)

- **Bookings**: Manually add or edit court bookings on behalf of users via the **Management > Bookings** page.
- **Events**: Create community events and manage registrations from the **Management > Events** page.
- **Channels**: Create and manage real-time communication channels for announcements or discussions under **Operations > Channels**.
- **Personnel**: Manage **Employees** and **Coaches** for your facility under the **Personnel** section.

---

## Step 4: Arena & Education Admin Onboarding

The process for Arena and Education admins is similar to the Living Space admin but with features tailored to their needs.

- **Arena Admins** will focus on setting up `Courts` with public/private visibility, managing `Coaches`, and tracking `Financials` like transfers and invoices.
- **Education Admins** will focus on creating `Attendance` sessions, managing `Events` like tournaments, tracking student `Skills`, and using communication tools like `Emergency Alerts` and `Notifications`.
