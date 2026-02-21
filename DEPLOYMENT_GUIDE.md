# 🚀 CareHub Database Deployment Guide

## Step 1: Deploy Database Schema to Supabase

### Go to Supabase Dashboard
1. Open your browser and navigate to: **https://iephqtkmguephvajgbhz.supabase.co**
2. Sign in to your Supabase account
3. You should see your project dashboard

### Run Database Schema
1. In the left sidebar, click on **"SQL Editor"**
2. Click **"New Query"** (usually a + button)
3. Open the file `database-schema.sql` from your project root
4. Copy **ALL** the content from `database-schema.sql`
5. Paste it into the SQL Editor
6. Click **"Run"** (or press Ctrl+Enter)
7. ✅ You should see "Success. No rows returned" or similar

### What this creates:
- `users` table (for login credentials)
- `doctor_profiles` table (doctor information)
- `patient_profiles` table (patient information)  
- `appointments` table (booking data)
- `notifications` table (system notifications)
- `time_slots` table (doctor availability)
- Indexes for performance
- Row Level Security (RLS) policies
- Triggers for automatic timestamps

---

## Step 2: Load Sample Data

### Run Sample Data Script
1. Still in the **SQL Editor**, create another **"New Query"**
2. Open the file `sample-data.sql` from your project root
3. Copy **ALL** the content from `sample-data.sql`
4. Paste it into the SQL Editor
5. Click **"Run"** (or press Ctrl+Enter)
6. ✅ You should see messages about inserting data

### What this creates:
- 6 demo doctors (Cardiology, Dermatology, Pediatrics, etc.)
- 6 demo patients
- 5 sample appointments
- Demo notifications
- Realistic medical data for testing

---

## Step 3: Test Database Connection

### Using the Test Page
1. Your app should be running at: **http://localhost:3001**
2. Go to: **http://localhost:3001/database-test**
3. Click **"🔍 Test Database Connection"**
4. ✅ Should show: "Database connection successful!"

### Using the Main App
1. Go to: **http://localhost:3001/login**
2. Try logging in with demo credentials:

**Demo Doctor Logins:**
- `9876543210` - Dr. Sarah Johnson (Cardiologist)
- `9876543211` - Dr. Michael Chen (Dermatologist)
- `9876543212` - Dr. Emily Davis (Pediatrician)

**Demo Patient Logins:**
- `9042222856` - John Smith
- `9042222857` - Jane Doe
- `9042222858` - Robert Wilson

---

## Step 4: Verify Everything Works

### Test Appointment Booking
1. Login as a patient (e.g., `9042222856`)
2. Go to patient dashboard
3. Click "Book Appointment"
4. Select a doctor and book an appointment
5. ✅ Should save to real database

### Test Doctor Dashboard
1. Login as a doctor (e.g., `9876543210`)
2. Go to doctor dashboard
3. View appointments
4. ✅ Should show real appointments from database

### Test Database Test Page
1. Go to: **http://localhost:3001/database-test**
2. Click **"🎯 Run All Tests"**
3. ✅ All tests should pass

---

## 🔧 Troubleshooting

### If Database Connection Fails:
1. Check your `.env.local` file has correct Supabase credentials
2. Make sure database schema was deployed successfully
3. Check Supabase dashboard for any error messages
4. Restart your development server: `npm run dev`

### If Login Doesn't Work:
1. Make sure sample data was loaded successfully
2. Check browser console for any JavaScript errors
3. Try the test page to verify database connectivity

### If Appointments Don't Show:
1. Verify sample data includes appointments
2. Check that user IDs match between login and appointments
3. Use the test page to verify appointment APIs work

---

## 🎯 Success Indicators

✅ **Database Schema Deployed** - SQL runs without errors  
✅ **Sample Data Loaded** - Demo users and appointments created  
✅ **Connection Test Passes** - Test page shows "Database connection successful"  
✅ **Login Works** - Can login with demo phone numbers  
✅ **Appointments Visible** - Doctor and patient dashboards show appointments  
✅ **New Bookings Save** - Can create new appointments that persist  

---

## 🚨 Important Notes

1. **Row Level Security**: Database has RLS enabled for security
2. **Real Data**: Once deployed, you're using real Supabase database
3. **Demo Data**: Sample data is realistic but fictional
4. **Backup**: Always backup before making schema changes
5. **Production**: Don't use demo credentials in production

---

## Next Steps After Deployment

1. **Customize Data**: Replace demo data with real doctors/patients
2. **Add Features**: Implement additional booking features
3. **Security**: Review and enhance RLS policies
4. **Performance**: Monitor and optimize database queries
5. **Backup**: Set up regular database backups

---

Ready to deploy? Follow the steps above in order! 🚀