# PTO & BCP Compliance Calendar

A shared calendar for plotting PTOs and holiday switches (single or multi-day) and tracking whether each person has sent their BCP and has the BCP discussion plotted. Shows people out this week, this month, and total PTOs plotted for the year.

- Everyone with the link can **view** the calendar and **export a CSV**.
- Only **admins** (people you give an admin key) can add, edit, tick checkboxes, or delete.

Files: `index.html` (the dashboard) and `Code.gs` (Google Apps Script that stores data in a Google Sheet).

## Step 1 - Google Sheet and backend
1. Go to sheets.google.com and create a blank sheet (any name).
2. Click **Extensions > Apps Script**. Delete the existing code, paste in everything from `Code.gs`, and click the save icon.
3. Add admin keys: click the **gear icon (Project Settings)** on the left, scroll to **Script properties**, click **Add script property**.
   - Property: `ADMIN_KEYS`
   - Value: one key per admin, separated by commas, for example `erwan-9xK2mQ,anna-7Tq4Lp`
   - Click **Save script properties**. Give each admin their own key. To remove someone, delete their key from this list.
4. Click **Deploy > New deployment**. Click the gear next to "Select type" and choose **Web app**.
   - Execute as: **Me**
   - Who has access: **Anyone**
   - Click **Deploy**, authorize when asked, and copy the **Web app URL**.
5. Test it: paste the URL into a browser tab and add `?action=list` at the end. You should see `{"ok":true,"entries":[]}`.

If you change `Code.gs` or the keys later, go to **Deploy > Manage deployments**, click the pencil, choose **New version**, and Deploy. The URL stays the same.

## Step 2 - Put the files on GitHub
1. Sign in at github.com. Click **+** (top right) > **New repository**. Name it `pto-bcp-dashboard`, choose **Public**, click **Create repository**.
2. On the new repo page, click **uploading an existing file**. Drag in `index.html`, `Code.gs`, and `README.md`, then click **Commit changes**.

## Step 3 - Connect the page to your sheet
1. In the repo, click `index.html`, then the **pencil icon** (Edit this file).
2. Press Ctrl+F (Cmd+F on Mac) and search for `API_URL`. You will find `const API_URL='';`.
3. Paste your Web app URL between the two quotes, for example `const API_URL='https://script.google.com/macros/s/.../exec';`.
4. Click **Commit changes** (top right), then **Commit changes** again.

## Step 4 - Publish with GitHub Pages
1. In the repo, click the **Settings** tab (top row of the repo).
2. In the left sidebar click **Pages**.
3. Under **Build and deployment**, set Source to **Deploy from a branch**. Set Branch to **main** and the folder to **/ (root)**, then click **Save**.
4. Wait 1-2 minutes and refresh the page. The link appears at the top: `https://<your-username>.github.io/pto-bcp-dashboard/`. Share it with the team.

## Using it
- Click **Admin sign in**, enter your key, and the Add, Edit, and checkbox controls unlock. The browser remembers you until you click **Admin: sign out**.
- **Export CSV** downloads every entry (all months and years) and opens in Excel or Sheets.

## Notes
- The key is checked by the backend, so a non-admin cannot save changes even by editing the page.
- Keys are stored in Script properties, not in the repo, so a public repo does not expose them. Keys are sent over HTTPS in the request URL, so use keys made for this tool and do not reuse a password.
- The Apps Script URL is visible in the page source. Anyone who has it can read the data, but cannot write without an admin key.
- The Google Sheet is your backup. Dates are stored as text (YYYY-MM-DD) so Sheets does not convert them.
