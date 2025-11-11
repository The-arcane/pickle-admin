#  Platform - QA Test Plan

This document outlines the test plan for the  platform, covering all user roles and key functionalities.

---

## Table of Contents
1.  [General & Authentication](#1-general--authentication)
2.  [Super Admin](#2-super-admin)
3.  [Living Space Admin](#3-living-space-admin)
4.  [Arena Admin](#4-arena-admin)
5.  [Education Admin](#5-education-admin)
6.  [Hospitality Admin](#6-hospitality-admin)
7.  [Sales](#7-sales)
8.  [Employee](#8-employee)

---

## 1. General & Authentication

| Test Case ID | Description | Steps to Reproduce | Expected Result | Test Type |
| :--- | :--- | :--- | :--- | :--- |
| AUTH-001 | Login with valid credentials (any role) | 1. Navigate to `/`. 2. Enter valid email and password. 3. Click "Sign In". | User is successfully logged in and redirected to their respective dashboard. | Pass |
| AUTH-002 | Login with invalid password | 1. Navigate to `/`. 2. Enter a valid email and an incorrect password. 3. Click "Sign In". | An error message "Invalid login credentials" is displayed. User remains on the login page. | Pass |
| AUTH-003 | Login with non-existent email | 1. Navigate to `/`. 2. Enter an email that is not in the database. 3. Click "Sign In". | An error message "Invalid login credentials" is displayed. | Pass |
| AUTH-004 | Access protected route while logged out | 1. Log out. 2. Attempt to navigate directly to `/super-admin/dashboard` (or any other protected route). | User is redirected to the login page (`/`). | Pass |
| AUTH-005 | Access another role's panel | 1. Log in as a Living Space Admin (`user_type=2`). 2. Attempt to navigate to `/super-admin/dashboard`. | User is redirected back to their own dashboard (`/livingspace`). | Pass |
| AUTH-006 | Logout functionality | 1. Log in to any account. 2. Click the user avatar in the top right. 3. Click "Log out". | User is redirected to the login page (`/`) and the session is terminated. | Pass |
| AUTH-007 | View Public Organization Page | 1. Navigate to `/o/[id]` for a valid organization ID. | A public-facing page with the organization's details is displayed. | Pass |
| AUTH-008 | View Non-existent Public Org Page | 1. Navigate to `/o/9999` (an ID that does not exist). | A 404 "Not Found" page is displayed. | Pass |

---

## 2. Super Admin

### 2.1 Dashboard
| Test Case ID | Description | Steps to Reproduce | Expected Result | Test Type |
| :--- | :--- | :--- | :--- | :--- |
| SA-DASH-001 | View Dashboard | 1. Log in as Super Admin. 2. Navigate to `/super-admin/dashboard`. | All stat cards (Total Living Spaces, Schools, Users, etc.) are displayed with numerical values. | Pass |
| SA-DASH-002 | Recent Bookings Table | 1. On the dashboard, view the "Recent Platform Activity" table. | The table loads with the 5 most recent bookings from any organization. | Pass |
| SA-DASH-003 | New Users List | 1. On the dashboard, view the "New Users" list. | The list shows the 5 most recently created users with their name, email, and time since joining. | Pass |

### 2.2 Platform Management (Living Spaces, Schools, Hospitality, Arena)

| Test Case ID | Description | Steps to Reproduce | Expected Result | Test Type |
| :--- | :--- | :--- | :--- | :--- |
| SA-PM-001 | View Organization List (for each type) | 1. Log in as Super Admin. 2. Navigate to `/super-admin/organisations`, `/super-admin/schools`, etc. | A table/list of all organizations of that type is displayed. | Pass |
| SA-PM-002 | Create New Organization (Happy Path) | 1. Navigate to an org page (e.g., `/super-admin/organisations`). 2. Click "Add...". 3. Fill in Name, Address, and select an **unassigned** admin from the "Owner" dropdown. 4. Click "Save". | The organization is created and appears in the list. The selected admin is now assigned to it and their `user_type` is updated correctly. | Pass |
| SA-PM-003 | Create Org with Assigned Admin | 1. Follow steps from SA-PM-002, but select an admin who **already owns** another organization. | The dropdown should not contain already assigned admins. If forced, the action should fail with an error. | Pass |
| SA-PM-004 | Activate/Deactivate Organization | 1. On the Living Spaces list, click the action menu for an organization. 2. Select "Activate" or "Deactivate". | The organization's status toggles between Active/Inactive in the list. | Pass |
| SA-PM-005 | Edit Organization | 1. From the org list, click "Edit". 2. Change the name and save. | The organization's name is updated in the list. | Pass |
| SA-PM-006 | Edit Organization Public Website | 1. From the org list, click "Edit Public Page". 2. Change text content and save. 3. Upload a new logo image and save. | Changes are saved successfully. Previewing the public page (`/o/[id]`) shows the new content. | Pass |

### 2.3 User Management (Admins, Sales)

| Test Case ID | Description | Steps to Reproduce | Expected Result | Test Type |
| :--- | :--- | :--- | :--- | :--- |
| SA-UM-001 | Create New Admin/Sales User | 1. Navigate to `/super-admin/admins` or `/super-admin/sales`. 2. Click "Add...". 3. Fill in all required details. 4. Click "Create User". | The user is created and appears in the list. | Pass |
| SA-UM-002 | Create User with Mismatched Passwords | 1. Follow steps from SA-UM-001, but enter different values in "Password" and "Confirm Password". | An error toast "Passwords do not match" appears. The user is not created. | Pass |
| SA-UM-003 | Remove Admin/Sales User | 1. On the user list, click the action menu for a user. 2. Select "Remove" and confirm. | The user is removed from the list. | Pass |

### 2.4 Data Management (Courts, Events, Bookings)

| Test Case ID | Description | Steps to Reproduce | Expected Result | Test Type |
| :--- | :--- | :--- | :--- | :--- |
| SA-COURT-001 | Filter Courts by Organization | 1. Navigate to `/super-admin/courts`. 2. Select an organization from the top dropdown. | The list updates to show only courts belonging to the selected organization. | Pass |
| SA-COURT-002 | Add a new Court | 1. Select an organization. 2. Navigate to `/super-admin/courts/add`. 3. Fill in all required court details. 4. Save. | The court is created and the user is redirected to the main courts list. | Pass |
| SA-COURT-003 | Edit an existing Court | 1. Navigate to a court's edit page. 2. Change the court's name and save. | The changes are saved successfully. | Pass |
| SA-EVENT-001 | Filter Events by Organization | 1. Navigate to `/super-admin/events`. 2. Select an organization. | The list updates to show events for that org. | Pass |
| SA-EVENT-002 | Create New Event | 1. Select an org. 2. Go to `/super-admin/events/add`. 3. Fill in all details. 4. Save. | Event is created successfully. | Pass |
| SA-BOOKING-001 | Filter Bookings by Organization | 1. Navigate to `/super-admin/bookings`. 2. Select an org. | The table updates to show only bookings for that org. | Pass |

### 2.5 Support (Tickets)

| Test Case ID | Description | Steps to Reproduce | Expected Result | Test Type |
| :--- | :--- | :--- | :--- | :--- |
| SA-TICKET-001 | View All Tickets | 1. Navigate to `/super-admin/tickets`. | All tickets from all orgs are displayed. | Pass |
| SA-TICKET-002 | Filter Tickets by Org | 1. Select an org from the header dropdown. | The ticket list filters to show only tickets from that org. | Pass |
| SA-TICKET-003 | Reply to a Ticket | 1. Click "View" on a ticket. 2. Type a reply and send. | The reply appears in the conversation view with "Super Admin" styling. | Pass |

---

## 3. Living Space Admin

| Test Case ID | Description | Steps to Reproduce | Expected Result | Test Type |
| :--- | :--- | :--- | :--- | :--- |
| LS-DASH-001 | View Dashboard | 1. Log in as a Living Space Admin. | The dashboard loads with stats like "Today's Bookings" and "Recent Activity". | Pass |
| LS-INV-001 | Invite Residents via CSV | 1. Go to `/livingspace/invitations`. 2. Click "Invite Users". 3. Upload a valid CSV. | A success toast appears with a summary. The invited users appear in the list with "invited" status. | Pass |
| LS-INV-002 | Invite Residents with Invalid CSV | 1. Go to `/livingspace/invitations`. 2. Upload a CSV missing the 'email' column. | An error toast "CSV file must contain 'Name' and 'email' columns" appears. | Pass |
| LS-APP-001 | Approve Join Request | 1. Go to `/livingspace/approvals`. 2. Click "Approve" for a pending request. 3. Assign Building/Wing/Flat. 4. Confirm approval. | The request is removed from the list. The user now appears in the main Users list. | Pass |
| LS-APP-002 | Reject Join Request | 1. Go to `/livingspace/approvals`. 2. Click "Reject" for a pending request and confirm. | The request is removed from the list. | Pass |
| LS-ORG-001 | Add Building/Wing/Flat | 1. Go to `/livingspace/organisations`. 2. Add a new building, then a wing, then manage flats to add a new flat. | The new structures are added successfully and appear in the accordion. | Pass |
| LS-COURT-001 | Add/Edit Court | 1. Go to `/livingspace/courts`. 2. Click "Add Court". 3. Fill in all details, including availability and rules. 4. Save. | Court is created and appears on the list. Editing should also succeed. | Pass |
| LS-COURT-002 | Manage Unavailability | 1. Go to `/livingspace/courts/[id]/slots`. 2. Add a one-off unavailability block. 3. Save. | The block is saved. Attempting to book this slot should fail. | Pass |
| LS-BOOK-001 | Create New Court Booking | 1. Go to `/livingspace/bookings`. 2. Click "Add Court Booking". 3. Select a user, court, date, and an available timeslot. 4. Save. | The new booking appears in the table. | Pass |
| LS-BOOK-002 | Create Overlapping Booking | 1. Go to `/livingspace/bookings`. 2. Try to create a booking for a slot that is already booked. | The available timeslot should be disabled. The action should fail if forced. | Pass |
| LS-BOOK-003 | Cancel Booking | 1. In the bookings list, use the action menu to cancel a booking. | The booking status changes to "Cancelled". | Pass |
| LS-EVENT-001 | Create/Edit Event | 1. Go to `/livingspace/events`. 2. Click "+ Add Event". 3. Fill in details, including sub-events. 4. Save. | The event is created and appears on the list. | Pass |
| LS-COACH-001 | Add/Edit Coach | 1. Go to `/livingspace/coaches`. 2. Click "Add Coach". 3. Fill in details, including creating a new user, specialization, and pricing. 4. Save. | The coach is created and appears on the list. | Pass |
| LS-CHAN-001 | Create Channel | 1. Go to `/livingspace/channels`. 2. Click "Add Channel". 3. Fill in details. 4. Save. | The new channel appears in the list. | Pass |
| LS-CHAN-002 | Invite Members to Channel | 1. Go to `/livingspace/channels/[id]`. 2. Click "Invite Members". 3. Select users and send invites. | The invited users appear in the member list with "pending" status. | Pass |
| LS-TICKET-001 | Raise a Ticket | 1. Go to `/livingspace/raise-ticket`. 2. Fill in the form and submit. | The new ticket appears in the "Recent Tickets" list. | Pass |

---

## 4. Arena Admin

| Test Case ID | Description | Steps to Reproduce | Expected Result | Test Type |
| :--- | :--- | :--- | :--- | :--- |
| AR-DASH-001 | View Dashboard | 1. Log in as an Arena Admin. | The dashboard loads with stats like "Total Revenue" and Quick Action buttons for Arena modules. | Pass |
| AR-BANK-001 | Save Bank Details | 1. Go to `/arena/bank-details`. 2. Fill in all bank detail fields. 3. Click "Save Details". | A success toast appears. The details are displayed (masked) in the "Currently Saved" card. | Pass |
| AR-BANK-002 | Save Incomplete Bank Details | 1. Go to `/arena/bank-details`. 2. Leave one field blank. 3. Click "Save Details". | A toast/error "All fields are required" appears. | Pass |
| AR-COURT-001 | Manage Court Visibility | 1. Go to `/arena/courts/add` or edit an existing court. 2. Toggle the "Public" switch. 3. Save. | The court's public/private status is updated. | Pass |
| AR-FIN-001 | View Financials | 1. Navigate to `/arena/transactions`, `/arena/invoices`, `/arena/transfers`. | Each page loads with relevant financial data for the arena. | Pass |
| AR-COACH-001 | Add/Edit Coach | 1. Go to `/arena/coaches`. 2. Add or edit a coach. | The coach's details are saved successfully. | Pass |
| AR-EVENT-001 | Create/Edit Event | 1. Go to `/arena/events`. 2. Add or edit an event. | The event's details are saved successfully. | Pass |
| AR-CHAN-001 | Create/Manage Channel | 1. Go to `/arena/channels`. 2. Add a new channel and invite members. | Channel is created and members are invited successfully. | Pass |

---

## 5. Education Admin

| Test Case ID | Description | Steps to Reproduce | Expected Result | Test Type |
| :--- | :--- | :--- | :--- | :--- |
| ED-DASH-001 | View Dashboard | 1. Log in as an Education Admin. | The dashboard loads with stats like "Attendance Today" and "Total Students". | Pass |
| ED-ATT-001 | Create Attendance Session | 1. Go to `/education/attendance/sessions/add`. 2. Fill in session details and select students. 3. Save. | The session is created and appears on the main attendance page. | Pass |
| ED-ATT-002 | Mark Attendance | 1. Go to `/education/attendance` and click "Mark Attendance" for a session. 2. Mark a student as "Absent". 3. Click "Submit & Lock". | Attendance is saved. A toast notification for the absentee is simulated. | Pass |
| ED-SKILL-001 | Track Skills | 1. Go to `/education/skills`. 2. Change a score in the skill metrics table for a student. | The input value changes. The progress chart for that student updates to reflect the new score. | Pass |
| ED-ALERT-001 | Send Emergency Alert | 1. Go to `/education/alerts`. 2. Write a message and select recipients. 3. Click "Send Immediate Alert". | A toast appears confirming the alert was sent. | Pass |
| ED-INV-001 | View Inventory | 1. Go to `/education/inventory`. | List of equipment is displayed with quantities and conditions. | Pass |
| ED-RES-001 | View Resources | 1. Go to `/education/resources`. | List of training videos/PDFs is displayed. | Pass |
| ED-SPON-001 | View Sponsors | 1. Go to `/education/sponsors`. | Sponsorship tracker table is displayed with progress bars. | Pass |
| ED-HEALTH-001 | View Health & Safety | 1. Go to `/education/health`. | Health records and injury logs are displayed. | Pass |

---

## 6. Hospitality Admin

| Test Case ID | Description | Steps to Reproduce | Expected Result | Test Type |
| :--- | :--- | :--- | :--- | :--- |
| HO-DASH-001 | View Dashboard | 1. Log in as Hospitality Admin. | Dashboard displays "Active Packages" and "Total Bookings" stats. | Pass |
| HO-PKG-001 | Create Package | 1. Go to `/hospitality/packages`. 2. Click "Add Package". 3. Fill in details and upload an image. 4. Save. | The new package card appears on the page. | Pass |
| HO-PKG-002 | Delete Package | 1. Go to `/hospitality/packages`. 2. Click the delete icon on a package and confirm. | The package is removed from the list. | Pass |
| HO-BOOK-001 | Manage Booking | 1. Go to `/hospitality/bookings`. 2. Click the action menu for a booking and select "Manage". 3. Change status to "Confirmed". 4. Save. | The booking's status badge updates to "Confirmed" in the table. | Pass |

---

## 7. Sales

| Test Case ID | Description | Steps to Reproduce | Expected Result | Test Type |
| :--- | :--- | :--- | :--- | :--- |
| SL-DASH-001 | View Dashboard | 1. Log in as Sales. | Dashboard displays the "Inactive Living Spaces" count. | Pass |
| SL-ORG-001 | View Inactive Orgs | 1. Go to `/sales/organisations`. | Only organizations with an "Inactive" status are listed. | Pass |
| SL-ORG-002 | Edit Public Page | 1. From the orgs list, click "Edit Public Page" for an inactive org. 2. Change the "About" text and save. | A success toast appears. The public page at `/o/[id]` reflects the change. | Pass |
| SL-ORG-003 | Activate an Org | 1. From the orgs list, click the action menu for an org. 2. Select "Activate". | The organization is now marked as "Active" and disappears from the Sales view. | Pass |

---

## 8. Employee

| Test Case ID | Description | Steps to Reproduce | Expected Result | Test Type |
| :--- | :--- | :--- | :--- | :--- |
| EM-DASH-001 | View Dashboard | 1. Log in as an Employee. | A simplified dashboard with links to "Scan QR", "View Bookings", and "View Events" is shown. | Pass |
| EM-SCAN-001 | Scan Valid QR Code (Check-in) | 1. Go to `/employee/scan`. 2. Allow camera access. 3. Scan a valid booking QR code for a "Confirmed" booking. | A success message appears with "Check-in successful". Booking details are shown. | Pass |
| EM-SCAN-002 | Scan Valid QR Code (Check-out) | 1. Scan a QR code for a booking that is currently "Ongoing". 2. Scan the *same QR code* again. | A success message appears with "Check-out successful". | Pass |
| EM-SCAN-003 | Scan Invalid QR Code | 1. Go to `/employee/scan`. 2. Scan a QR code that does not correspond to a booking in the system. | A failure message "Booking not found" or similar appears. | Pass |
| EM-SCAN-004 | Scan Completed Booking QR | 1. Go to `/employee/scan`. 2. Scan a QR for a booking already marked "Completed". | A failure message "This booking has already been marked as completed" appears. | Pass |
| EM-VIEW-001 | View Bookings/Events | 1. Go to `/employee/bookings` or `/employee/events`. | A read-only list of all bookings/events for the employee's assigned organization is displayed. | Pass |
