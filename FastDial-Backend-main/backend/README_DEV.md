Development startup instructions

1) Ensure MySQL is running locally and you have the `mysql` CLI available.

2) Import the provided seed SQL (run from PowerShell or any shell):

```powershell
cd backend
mysql -u root -p < db_seed.sql
```

When prompted, enter your MySQL password (default set in `.env` as `DB_PASSWORD`).

If you prefer a GUI (MySQL Workbench / phpMyAdmin), open `db_seed.sql` and run the script there.

Default admin login created by the seed:

- Email: `admin@quickserve.local`
- Password: `Admin@12345`

3) Start the backend (in `backend` folder):

```powershell
npm install
npm run start
```

Backend will run on the port configured in `.env` (default `3000`).

4) Start the frontend (in `user_vendor_frontend`):

```powershell
cd ../Fast-Dial-main/user_vendor_frontend
npm install
npm run dev
```

Vite dev server runs on `http://localhost:5173` by default.

5) Verify vendor form dropdowns:
- Open `http://localhost:5173` and open the vendor listing or "List your service" form.
- The Business Category dropdown is populated from `/api/v1/vendors/data/getServiceWithCategory` (backend).

Notes & Troubleshooting:
- If backend still crashes on startup, check `.env` for `RAZORPAY_*` and `AWS_*` values; these are optional in dev because the server uses local fallbacks for uploads and lazy Razorpay init.
- If the frontend shows "Network Error", confirm `user_vendor_frontend/.env` has `VITE_API_URL=http://localhost:3000/api/v1` and that the backend is running.
- To enable S3 or Razorpay in dev, set the respective keys in `.env` and restart the backend.



<!-- http://localhost:5173/vendorsignup -->