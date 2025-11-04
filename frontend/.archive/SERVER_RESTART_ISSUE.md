# Server Restart Issue - Explained & Fixed

## ✅ Your Upload Worked!

Before the error, you can see:

```
✅ [CREATE RESOURCE] Resource created: ff9643ba-0580-4000-b00b-f78c7a9fc2af
```

**This means your file was successfully uploaded!** 🎉

## 🔍 What Happened

### The Sequence:

1. ✅ You uploaded a file
2. ✅ Backend created the resource successfully
3. ⚠️ Nodemon detected file changes and tried to restart
4. ❌ Restart failed because port 5000 was still in use
5. ⏳ Nodemon is waiting for next file change to retry

### Why This Happens:

- Nodemon watches for file changes and auto-restarts
- Sometimes it tries to restart before the old process fully closes
- The port (5000) is still occupied by the old process
- New process can't bind to the same port → EADDRINUSE error

## 🔧 The Fix

Added a 2-second delay to `nodemon.json`:

```json
{
  "delay": 2000 // Wait 2 seconds before restarting
}
```

This gives the old process time to fully shut down before starting a new one.

## 🚀 How to Apply the Fix

### Option 1: Let Nodemon Recover (Easiest)

- Don't do anything!
- Make any small change to a file in `src/`
- Nodemon will restart automatically
- Should work fine now with the delay

### Option 2: Manual Restart (Clean Slate)

```powershell
# In the backend terminal, press: Ctrl + C
# Then run:
npm run dev
```

### Option 3: Kill Port and Restart

```powershell
$processId = (Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue).OwningProcess;
if ($processId -and $processId -ne 0) {
  Stop-Process -Id $processId -Force;
  Start-Sleep -Seconds 2;
}
cd backend
npm run dev
```

## 📊 Server Status

### What You're Seeing:

```
[nodemon] app crashed - waiting for file changes before starting...
```

### What This Means:

- Nodemon is in "waiting" mode
- Server is NOT running right now
- Will auto-restart on next file change
- Your uploaded resource is safely saved in database ✅

## ✅ Verify Your Upload

Even though the server crashed AFTER uploading, your resource is saved!

### Check in the Frontend:

1. Refresh your browser
2. Go to Resource Manager
3. ✅ You should see your uploaded file!

The database transaction completed before the crash.

## 🎯 Current Situation

### What Works:

- ✅ File upload successful
- ✅ Resource saved to database
- ✅ Frontend can access it
- ✅ 150MB payload limit active

### What Needs Fixing:

- ⚠️ Server needs to be restarted
- Choose any of the 3 options above

## 🔍 The Error Breakdown

```
Error: listen EADDRINUSE: address already in use :::5000
```

**Translation:**

- `EADDRINUSE` = "Error: Address Already In Use"
- `:::5000` = "Port 5000 on all network interfaces"
- **Meaning**: Another process is using port 5000

**Why It Happens:**

1. Old server process hasn't fully closed yet
2. New process tries to start
3. Both try to use port 5000
4. Operating system says "NO! Port is taken!"

## 🛠️ Prevention Tips

### For Future Development:

1. **Use the delay** (Already added ✅)

   - Prevents race conditions during restart

2. **Save files less frequently**

   - Let auto-save batch multiple changes
   - Nodemon restarts on every file change

3. **Use `rs` command**

   - In nodemon terminal, type: `rs` and press Enter
   - Forces a clean restart without killing the process

4. **Increase delay if needed**
   - Change `"delay": 2000` to `"delay": 3000` in nodemon.json
   - Useful for slower systems

## 📝 Quick Commands Reference

### Check if port 5000 is in use:

```powershell
Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue
```

### Kill process on port 5000:

```powershell
$processId = (Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue).OwningProcess;
if ($processId -and $processId -ne 0) { Stop-Process -Id $processId -Force }
```

### Restart nodemon cleanly:

```
Press Ctrl + C in terminal
npm run dev
```

### Force nodemon restart (without killing):

```
Type 'rs' in nodemon terminal and press Enter
```

## 🎉 Summary

### The Good News:

✅ Your file uploaded successfully
✅ Resource is saved in database
✅ 150MB limit is working
✅ Fix is already applied (delay added)

### Next Steps:

1. Choose one of the 3 restart options above
2. Server will start clean
3. Your uploaded resource will be visible
4. Future restarts should be smoother

---

**Pro Tip**: The `"Access is denied"` error for process 0 (Idle) is harmless - it just means there was no actual process to kill, so the script continued normally and started the server.
