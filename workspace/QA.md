# Lumen Platform - QA Test Plan

This document outlines the test plan for the Lumen platform, covering all user roles and key functionalities.

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
| AUTH-002 | Login with invalid password | 1. Navigate to `/`. 2. Enter a valid email and an incorrect password. 3. Click "Sign In". | An error message "Invalid login credentials" is displayed. User remains on the login page. | Fail |
| AUTH-003 | Login with non-existent email | 1. Navigate to `/`. 2. Enter an email that is not in the database. 3. Click "Sign In". | An error message "Invalid login credentials" is displayed. | Fail |
| AUTH-004 | Access protected route while logged out | 1. Log out. 2. Attempt to navigate directly to `/super-admin/dashboard` (or any other protected route). | User is redirected to the login page (`/`). | Fail |
| AUTH-005 | Access another role's panel | 1. Log in as a Living Space Admin (`user_type=2`). 2. Attempt to navigate to `/super-admin/dashboard`. | User is redirected back to their own dashboard (`/livingspace`). | Fail |
| AUTH-006 | Logout functionality | 1. Log in to any account. 2. Click the user avatar in the top right. 3. Click "Log out". | User is redirected to the login page (`/`) and the session is terminated. | Pass |

---

## 2. Super Admin

### 2.1 Dashboard
| Test Case ID | Description | Steps to Reproduce | Expected Result | Test Type |
| :--- | :--- | :--- | :--- | :--- |
| SA-DASH-001 | View Dashboard | 1. Log in as Super Admin. 2. Navigate to `/super-admin/dashboard`. | All stat cards (Total Orgs, Users, Courts, etc.) are displayed with numerical values. | Pass |
| SA-DASH-002 | Recent Bookings Table | 1. On the dashboard, view the "Recent Platform Activity" table. | The table loads with the 5 most recent bookings from any organization. | Pass |
| SA-DASH-003 | New Users List | 1. On the dashboard, view the "New Users" list. | The list shows the 5 most recently created users with their name, email, and time since joining. | Pass |

### 2.2 Platform Management (Living Spaces, Schools, Hospitality, Arena)

| Test Case ID | Description | Steps to Reproduce | Expected Result | Test Type |
| :--- | :--- | :--- | :--- | :--- |
| SA-PM-001 | View Organization List | 1. Log in as Super Admin. 2. Navigate to `/super-admin/organisations` (or schools, etc.). | A table/list of all organizations of that type is displayed. | Pass |
| SA-PM-002 | Create New Organization (Happy Path) | 1. Navigate to an org page (e.g., `/super-admin/organisations`). 2. Click "Add Living Space". 3. Fill in Name, Address, and select an **unassigned** admin from the "Owner" dropdown. 4. Click "Save". | The organization is created and appears in the list. The selected admin is now assigned to it. | Pass |
| SA-PM-003 | Create Org with Assigned Admin | 1. Follow steps from SA-PM-002, but select an admin who **already owns** another organization. | An error message "This user is already an admin of another organization" is displayed. | Fail |
| SA-PM-004 | Activate/Deactivate Organization | 1. On the org list page, click the action menu for an organization. 2. Select "Activate" or "Deactivate". | The organization's status toggles between Active/Inactive in the list. | Pass |
| SA-PM-005 | Edit Organization | 1. From the org list, click "Edit". 2. Change the name and save. | The organization's name is updated in the list. | Pass |

### 2.3 User Management (Admins, Sales)

| Test Case ID | Description | Steps to Reproduce | Expected Result | Test Type |
| :--- | :--- | :--- | :--- | :--- |
| SA-UM-001 | Create New Admin/Sales User | 1. Navigate to `/super-admin/admins` or `/super-admin/sales`. 2. Click "Add Admin/Sales Person". 3. Fill in all required details. 4. Click "Create User". | The user is created and appears in the list. | Pass |
| SA-UM-002 | Create User with Mismatched Passwords | 1. Follow steps from SA-UM-001, but enter different values in "Password" and "Confirm Password". | An error toast "Passwords do not match" appears. The user is not created. | Fail |
| SA-UM-003 | Remove Admin/Sales User | 1. On the user list, click the action menu for a user. 2. Select "Remove" and confirm. | The user is removed from the list. | Pass |

### 2.4 Data Pages (Courts, Bookings, Events, etc.)

| Test Case ID | Description | Steps to Reproduce | Expected Result | Test Type |
| :--- | :--- | :--- | :--- | :--- |
| SA-DATA-001 | Filter Data by Organization | 1. Navigate to `/super-admin/courts`. 2. Select an organization from the top dropdown. | The list updates to show only courts belonging to the selected organization. | Pass |
| SA-DATA-002 | Add a new Court | 1. Select an organization. 2. Navigate to `/super-admin/courts/add`. 3. Fill in all required court details. 4. Save. | The court is created and the user is redirected to the main courts list. | Pass |
| SA-DATA-003 | Edit an existing Court | 1. Navigate to a court's edit page. 2. Change the court's name and save. | The changes are saved successfully. | Pass |

---

## 3. Living Space Admin

| Test Case ID | Description | Steps to Reproduce | Expected Result | Test Type |
| :--- | :--- | :--- | :--- | :--- |
| LS-DASH-001 | View Dashboard | 1. Log in as a Living Space Admin. | The dashboard loads with stats like "Today's Bookings" and "Recent Activity". | Pass |
| LS-INV-001 | Invite Residents via CSV | 1. Go to `/livingspace/invitations`. 2. Click "Invite Residents". 3. Upload a valid CSV. | A success toast appears with a summary. The invited users appear in the list with "invited" status. | Pass |
| LS-INV-002 | Invite Residents with Invalid CSV | 1. Go to `/livingspace/invitations`. 2. Upload a CSV missing the 'email' column. | An error toast "CSV file must contain 'Name' and 'email' columns" appears. | Fail |
| LS-APP-001 | Approve Join Request | 1. Go to `/livingspace/approvals`. 2. Click "Approve" for a pending request. 3. Assign Building/Wing/Flat. 4. Confirm approval. | The request is removed from the list. The user now appears in the main Users list. | Pass |
| LS-ORG-001 | Add Building/Wing/Flat | 1. Go to `/livingspace/organisations`. 2. Add a new building, then a wing, then manage flats to add a new flat. | The new structures are added successfully and appear in the accordion. | Pass |
| LS-BOOK-001 | Create New Court Booking | 1. Go to `/livingspace/bookings`. 2. Click "Add Court Booking". 3. Select a user, court, date, and an available timeslot. 4. Save. | The new booking appears in the table. | Pass |

---

## 4. Arena Admin

| Test Case ID | Description | Steps to Reproduce | Expected Result | Test Type |
| :--- | :--- | :--- | :--- | :--- |
| AR-DASH-001 | View Dashboard | 1. Log in as an Arena Admin. | The dashboard loads with stats like "Total Revenue" and Quick Action buttons for Arena modules. | Pass |
| AR-BANK-001 | Save Bank Details | 1. Go to `/arena/bank-details`. 2. Fill in all bank detail fields. 3. Click "Save Details". | A success toast appears. The details are displayed (masked) in the "Currently Saved" card. | Pass |
| AR-BANK-002 | Save Incomplete Bank Details | 1. Go to `/arena/bank-details`. 2. Leave one field blank. 3. Click "Save Details". | An error toast "All fields are required" appears. | Fail |
| AR-COURT-001 | Manage Court Visibility | 1. Go to `/arena/courts/add` or edit an existing court. 2. Toggle the "Public" switch. 3. Save. | The court's public/private status is updated. | Pass |
| AR-FIN-001 | View Financials | 1. Navigate to `/arena/transactions`, `/arena/invoices`, `/arena/transfers`. | Each page loads with relevant financial data for the arena. | Pass |

---

## 5. Education Admin

| Test Case ID | Description | Steps to Reproduce | Expected Result | Test Type |
| :--- | :--- | :--- | :--- | :--- |
| ED-DASH-001 | View Dashboard | 1. Log in as an Education Admin. | The dashboard loads with stats like "Attendance Today" and "Total Students". | Pass |
| ED-ATT-001 | Create Attendance Session | 1. Go to `/education/attendance/sessions/add`. 2. Fill in session details and select students. 3. Save. | The session is created and appears on the main attendance page. | Pass |
| ED-ATT-002 | Mark Attendance | 1. Go to `/education/attendance` and click "Mark Attendance" for a session. 2. Mark a student as "Absent". 3. Click "Submit & Lock". | Attendance is saved. A toast notification for the absentee is simulated. | Pass |
| ED-SKILL-001 | Track Skills | 1. Go to `/education/skills`. 2. Change a score in the skill metrics table for a student. | The input value changes. The progress chart for that student updates to reflect the new score. | Pass |
| ED-ALERT-001 | Send Emergency Alert | 1. Go to `/education/alerts`. 2. Write a message and select recipients. 3. Click "Send Immediate Alert". | A toast appears confirming the alert was sent. | Pass |

---

## 6. Hospitality Admin

| Test Case ID | Description | Steps to Reproduce | Expected Result | Test Type |
| :--- | :--- | :--- | :--- | :--- |
| HO-DASH-001 | View Dashboard | 1. Log in as Hospitality Admin. | Dashboard displays "Active Packages" and "Total Bookings" stats. | Pass |
| HO-PKG-001 | Create Package | 1. Go to `/hospitality/packages`. 2. Click "Add Package". 3. Fill in details and upload an image. 4. Save. | The new package card appears on the page. | Pass |
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
| EM-SCAN-001 | Scan Valid QR Code | 1. Go to `/employee/scan`. 2. Allow camera access. 3. Scan a valid booking QR code. | A success message appears with the booking details (User, Court/Event, Time). | Pass |
| EM-SCAN-002 | Scan Invalid QR Code | 1. Go to `/employee/scan`. 2. Scan a QR code that does not correspond to a booking. | A failure message "Booking not found" or similar appears. | Fail |
| EM-VIEW-001 | View Bookings/Events | 1. Go to `/employee/bookings` or `/employee/events`. | A read-only list of all bookings/events for the employee's assigned organization is displayed. | Pass |

