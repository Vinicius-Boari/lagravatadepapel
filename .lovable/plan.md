I will fix the issues in the Admin panel, focusing on the Backup section and ensuring the user's "Owner" status is correctly recognized.

### Plan:

1.  **Database Permission Audit**:
    - Ensure `viniciusbataglia500@gmail.com` is definitively the only 'owner' in the `user_roles` table (which it is, but I will double-check the logic).
    - Fix the `[object Response]` error by updating `BackupExport.tsx` to properly catch and display errors from server functions.

2.  **Server Functions Reliability**:
    - Update `src/server/backup.functions.ts` to include more detailed error logging and ensure it returns standard Error objects that the frontend can handle.
    - Check why `getBackupSettings` and `listBackups` might be returning a Response instead of data for the logged-in user.

3.  **Frontend Polish & Verification**:
    - Update `AdminDashboard.tsx` to ensure the "Dono" label is correctly displayed based on the `isOwner` flag from `useAuth`.
    - Verify other tabs (`UserManagement`, `ActivityLogs`, `VisualIdentity`) to ensure they load data correctly without instability.
    - Add a check to `useAuth.ts` to log the exact role found for debugging.

4.  **Admin UI Improvements**:
    - Ensure all categories in the Admin panel have consistent loading states and error handling.
